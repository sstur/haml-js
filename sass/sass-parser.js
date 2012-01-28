"use strict";
var util = require('../lib/util');
var Class = require('../lib/class');

var Sass = require('./sass');
var SassFile = require('./sass-file');
var SassRenderer = require('./renderers/sass-renderer');

var SassRootNode = require('./tree/sass-root-node')
  , SassDirectiveNode = require('./tree/sass-directive-node')
  , SassCommentNode = require('./tree/sass-comment-node')
  , SassVariableNode = require('./tree/sass-variable-node')
  , SassPropertyNode = require('./tree/sass-property-node')
  , SassMixinDefinitionNode = require('./tree/sass-mixin-definition-node')
  , SassMixinNode = require('./tree/sass-mixin-node')
  , SassRuleNode = require('./tree/sass-rule-node')
  , SassExtendNode = require('./tree/sass-extend-node')
  , SassImportNode = require('./tree/sass-import-node')
  , SassForNode = require('./tree/sass-for-node')
  , SassIfNode = require('./tree/sass-if-node')
  , SassElseNode = require('./tree/sass-else-node')
  , SassWhileNode = require('./tree/sass-while-node')
  , SassDebugNode = require('./tree/sass-debug-node');

/**
 * @class SassParser
 * Parses [.sass and .sccs](http://sass-lang.com/) files.
 */
var SassParser = module.exports = Class.extend({
  // constants
  CACHE: true,
  CACHE_LOCATION: './sass-cache',
  CSS_LOCATION: './css',
  TEMPLATE_LOCATION: './sass-templates',
  BEGIN_COMMENT: '/',
  BEGIN_CSS_COMMENT: '/*',
  END_CSS_COMMENT: '*/',
  BEGIN_SASS_COMMENT: '//',
  BEGIN_INTERPOLATION: '#',
  BEGIN_INTERPOLATION_BLOCK: '#{',
  BEGIN_BLOCK: '{',
  END_BLOCK: '}',
  END_STATEMENT: ';',
  DOUBLE_QUOTE: '"',
  SINGLE_QUOTE: "'",

  /**
   * string the character used for indenting
   * @see indentChars
   * @see indentSpaces
   */
  indentChar: null,
  /**
   * array allowable characters for indenting
   */
  indentChars: [' ', "\t"],
  /**
   * integer number of spaces for indentation.
   * Used to calculate `Level` if `indentChar` is space.
   */
  indentSpaces: 2,

  /**
   * string source
   */
  source: null,

  /**
   * {Boolean} Whether parsed Sass files should be cached, allowing greater speed.
   * Defaults to true.
   */
  cache: null,

  /**
   * {String} The path where the cached sassc files should be written to.
   * Defaults to './sass-cache'.
   */
  cache_location: null,

  /**
   * {String} The path where CSS output should be written to.
   * Defaults to './css'.
   */
  css_location: null,

  /**
   * {Boolean} When true the line number and file where a selector is defined
   * is emitted into the compiled CSS in a format that can be understood by the
   * [FireSass Firebug extension](https://addons.mozilla.org/en-US/firefox/addon/103988/)
   * Disabled when using the compressed output style.
   *
   * Defaults to false.
   * @see style
   */
  debug_info: null,

  /**
   * {Object} Sass extensions, e.g. Compass.
   * An object of the form `{name: options}` where `name` is the name of the
   * extension and `options` is an object of name-value pairs.
   */
  extensions: null,

  /**
   * {String} The filename of the file being rendered.
   * This is used solely for reporting errors.
   */
  filename: null,

  /**
   * {Array} An array of filesystem paths which should be searched for
   * SassScript functions.
   */
  function_paths: null,

  /**
   * {Number} The number of the first line of the Sass template. Used for
   * reporting line numbers for errors. This is useful to set if the Sass
   * template is embedded.
   *
   * Defaults to 1.
   */
  line: null,

  /**
   * {Boolean} When true the line number and filename where a selector is
   * defined is emitted into the compiled CSS as a comment. Useful for debugging
   * especially when using imports and mixins.
   * Disabled when using the compressed output style or the debug_info option.
   *
   * Defaults to false.
   * @see debug_info
   * @see style
   */
   line_numbers: null,

  /**
   * {Array} An array of filesystem paths which should be searched for
   * Sass templates imported with the @import directive.
   *
   * Defaults to './sass-templates'.
   */
  load_paths: null,

  /**
   * {String} Forces the document to use one syntax for
   * properties. If the correct syntax isn't used, an error is thrown.
   * Value can be:
   * + new - forces the use of a colon or equals sign after the property name.
   * For example   color: #0f3 or width: $main_width.
   * + old -  forces the use of a colon before the property name.
   * For example: :color #0f3 or :width = $main_width.
   *
   * By default, either syntax is valid.
   *
   * Ignored for SCSS files which always use the new style.
   */
  property_syntax: null,

  /**
   * {Boolean} When set to true, causes warnings to be disabled.
   * Defaults to false.
   */
  quiet: null,

  /**
   * {String} the style of the CSS output.
   * Value can be:
   * + nested - Nested is the default Sass style, because it reflects the
   * structure of the document in much the same way Sass does. Each selector
   * and rule has its own line with indentation is based on how deeply the rule
   * is nested. Nested style is very useful when looking at large CSS files as
   * it allows you to very easily grasp the structure of the file without
   * actually reading anything.
   * + expanded - Expanded is the typical human-made CSS style, with each selector
   * and property taking up one line. Selectors are not indented; properties are
   * indented within the rules.
   * + compact - Each CSS rule takes up only one line, with every property defined
   * on that line. Nested rules are placed with each other while groups of rules
   * are separated by a blank line.
   * + compressed - Compressed has no whitespace except that necessary to separate
   * selectors and properties. It's not meant to be human-readable.
   *
   * Defaults to 'nested'.
   */
  style: null,

  /**
   * {String} The syntax of the input file.
   * 'sass' for the indented syntax and 'scss' for the CSS-extension syntax.
   *
   * This is set automatically when parsing a file, else defaults to 'sass'.
   */
  syntax: null,

  /**
   * {String} Path to the root sass template directory for your
   * application.
   */
  template_location: null,

  /**
   * If enabled a property need only be written in the standard form and vendor
   * specific versions will be added to the style sheet.
   * mixed array: vendor properties, merged with the built-in vendor
   * properties, to automatically apply.
   * Boolean true: use built in vendor properties.
   *
   * Defaults to vendor_properties disabled.
   * @see _vendorProperties
   */
  vendor_properties: {},

  /**
   * {Array} built-in vendor properties
   * @see vendor_properties
   */
  _vendorProperties: {
    'border-radius': [
      '-moz-border-radius',
      '-webkit-border-radius',
      '-khtml-border-radius'
    ],
    'border-top-right-radius': [
      '-moz-border-radius-topright',
      '-webkit-border-top-right-radius',
      '-khtml-border-top-right-radius'
    ],
    'border-bottom-right-radius': [
      '-moz-border-radius-bottomright',
      '-webkit-border-bottom-right-radius',
      '-khtml-border-bottom-right-radius'
    ],
    'border-bottom-left-radius': [
      '-moz-border-radius-bottomleft',
      '-webkit-border-bottom-left-radius',
      '-khtml-border-bottom-left-radius'
    ],
    'border-top-left-radius': [
      '-moz-border-radius-topleft',
      '-webkit-border-top-left-radius',
      '-khtml-border-top-left-radius'
    ],
    'box-shadow': ['-moz-box-shadow', '-webkit-box-shadow'],
    'box-sizing': ['-moz-box-sizing', '-webkit-box-sizing'],
    'opacity': ['-moz-opacity', '-webkit-opacity', '-khtml-opacity']
  },

  /**
   * Sets parser options
   * @param {Object} opts - Options
   * @returns {SassParser}
   */
  init: function(opts) {
    if (!opts) {
      throw new Sass.Exception('{what} must be a {type}', {'what': 'options', 'type': 'array'});
    }
    if (opts['language']) {
      Sass.language = opts['language'];
    }
    var self = this.constructor.prototype;

    //TODO: make this non-blocking
    if (opts['extensions']) {
      for (var extension in opts['extensions']) {
        var extOptions = opts['extensions'][extension];
        var configClass = require('./extensions/' + extension + '/config');
        var config = new configClass();
        config.config(extOptions);

        var lp = './extensions/' + extension + '/frameworks';
        var fp = './extensions/' + extension + '/functions';
        opts['load_paths'] = (opts['load_paths'] ? opts['load_paths'].concat([lp]) : [lp]);
        opts['function_paths'] = (opts['function_paths'] ? opts['function_paths'].concat([fp]) : [fp]);
      }
    }

    if (opts['vendor_properties']) {
      if (opts['vendor_properties'] === true) {
        this.vendor_properties = this._vendorProperties;
      } else
      if (opts['vendor_properties']) {
        this.vendor_properties = this.vendor_properties.concat(this._vendorProperties);
      }
    }
    delete opts['language'];
    delete opts['vendor_properties'];

    var defaultOptions = {
      'cache': self.CACHE,
      'cache_location': __dirname + '/' + self.CACHE_LOCATION,
      'css_location': __dirname + '/' + self.CSS_LOCATION,
      'debug_info': false,
      'filename': {'dirname': '', 'basename': ''},
      'function_paths': [],
      'load_paths': [__dirname + '/' + self.TEMPLATE_LOCATION],
      'line': 1,
      'line_numbers': false,
      'style': SassRenderer.STYLE_NESTED,
      'syntax': SassFile.SASS
    };

    var obj = util.merge({}, defaultOptions, opts);
    for (var name in obj) {
      var value = obj[name];
      if (typeof this[name] != 'undefined') {
        this[name] = value;
      }
    }
  },

  //TODO: determine if all these getter methods are necessary
  getCache: function() {
    return this.cache;
  },
  getCache_location: function() {
    return this.cache_location;
  },
  getCss_location: function() {
    return this.css_location;
  },
  getDebug_info: function() {
    return this.debug_info;
  },
  getFilename: function() {
    return this.filename;
  },
  getLine: function() {
    return this.line;
  },
  getSource: function() {
    return this.source;
  },
  getLine_numbers: function() {
    return this.line_numbers;
  },
  getFunction_paths: function() {
    return this.function_paths;
  },
  getLoad_paths: function() {
    return this.load_paths;
  },
  getProperty_syntax: function() {
    return this.property_syntax;
  },
  getQuiet: function() {
    return this.quiet;
  },
  getStyle: function() {
    return this.style;
  },
  getSyntax: function() {
    return this.syntax;
  },
  getTemplate_location: function() {
    return this.template_location;
  },
  getVendor_properties: function() {
    return this.vendor_properties;
  },

  /**
   * Gets the set of default options
   */
  getOptions: function() {
    return {
      'cache': this.cache,
      'cache_location': this.cache_location,
      'css_location': this.css_location,
      'filename': this.filename,
      'function_paths': this.function_paths,
      'line': this.line,
      'line_numbers': this.line_numbers,
      'load_paths': this.load_paths,
      'property_syntax': this.property_syntax,
      'quiet': this.quiet,
      'style': this.style,
      'syntax': this.syntax,
      'template_location': this.template_location,
      'vendor_properties': this.vendor_properties
    };
  },

  /**
   * Parse a sass file or Sass source code and returns the CSS.
   * @param {string} source - name of source file or Sass source
   * @param {boolean} [isFile=true]
   * @returns {string} CSS
   */
  toCss: function(source, isFile) {
    if (isFile == null) isFile = true;
    return this.parse(source, isFile).render();
  },

  /**
   * Parse a sass file or Sass source code and
   * returns the document tree that can then be rendered.
   * The file will be searched for in the directories specified by the
   * load_paths option.
   * If caching is enabled a cached version will be used if possible or the
   * compiled version cached if not.
   * @param {string} source - name of source file or Sass source
   * @param {boolean} [isFile=true]
   * @returns {SassRootNode} Root node of document tree
   */
  parse: function(source, isFile) {
    if (isFile == null) isFile = true;
    if (isFile) {
      throw new Error('Filesystem not implemented');
      //TODO: remove filesystem calls
      //this.filename = SassFile.getFile(source, this);
      //if (isFile) {
      //  this.syntax = this.filename.substr(-4);
      //} else
      //if (this.syntax !== SassFile.SASS && this.syntax !== SassFile.SCSS) {
      //  throw new Sass.Exception('Invalid {what}', {'what': 'syntax option'});
      //}
      //if (this.cache) {
      //  var cached = SassFile.getCachedFile(this.filename, this.cache_location);
      //  if (cached !== false) {
      //    return cached;
      //  }
      //}
      //var tree = this.toTree(util.file_get_contents(this.filename));
      //if (this.cache) {
      //  SassFile.setCachedFile(tree, this.filename, this.cache_location);
      //}
      //return tree;
    } else {
      return this.toTree(source);
    }
  },



  /**
   * Parse Sass source into a document tree.
   * If the tree is already created return that.
   * @param {string} source - Sass source
   * @returns {SassRootNode} the root of this document tree
   */
  toTree: function(source) {
    if (this.syntax === SassFile.SASS) {
      this.source = source.split('\n');
      this.setIndentChar();
    } else {
      this.source = source;
    }
    //unset(source);
    var root = new SassRootNode(this);
    this.buildTree(root);
    return root;
  },

  /**
   * Builds a parse tree under the parent node.
   * Called recursively until the source is parsed.
   * @param {SassNode} parent
   */
  buildTree: function(parent) {
    var node = this.getNode(parent);
    while (node && node.isChildOf(parent)) {
      parent.addChild(node);
      node = this.buildTree(node);
    }
    return node;
  },

  /**
   * Creates and returns the next SassNode.
   * The tpye of SassNode depends on the content of the SassToken.
   * @returns {SassNode} a SassNode of the appropriate type or null when no more
   * source to parse.
   */
  getNode: function(node) {
    var token = this.getToken();
    if (!token) {
      return null;
    }
    if (SassDirectiveNode.isa(token)) {
      return this.parseDirective(token, node);
    }
    if (SassCommentNode.isa(token)) {
      return new SassCommentNode(token);
    }
    if (SassVariableNode.isa(token)) {
      return new SassVariableNode(token);
    }
    if (SassPropertyNode.isa(token, this.property_syntax)) {
      return new SassPropertyNode(token, this.property_syntax);
    }
    if (SassMixinDefinitionNode.isa(token)) {
      if (this.syntax === SassFile.SCSS) {
        throw new Sass.Exception('Mixin {which} shortcut not allowed in SCSS', {'which': 'definition'}, this);
      }
      return new SassMixinDefinitionNode(token);
    }
    if (SassMixinNode.isa(token)) {
      if (this.syntax === SassFile.SCSS) {
        throw new Sass.Exception('Mixin {which} shortcut not allowed in SCSS', {'which': 'include'}, this);
      }
      return new SassMixinNode(token);
    }
    return new SassRuleNode(token);
  },

  /**
   * Returns a token object that contains the next source statement and
   * meta data about it.
   * @returns {object}
   */
  getToken: function() {
    return (this.syntax === SassFile.SASS ? this.sass2Token() : this.scss2Token());
  },

  /**
   * Returns an object that contains the next source statement and meta data
   * about it from SASS source.
   * Sass statements are passed over. Statements spanning multiple lines, e.g.
   * CSS comments and selectors, are assembled into a single statement.
   * @returns {object} Statement token. Null if end of source.
   */
  sass2Token: function() {
    var self = this.constructor.prototype;
    var statement = ''; // source line being tokenized
    var token, source;

    while (!token && this.source) {
      while (!statement && this.source) {
        source = this.source.shift();
        statement = source.trim();
        this.line++;
      }

      if (!statement) {
        break;
      }

      var level = this.getLevel(source);

      // Comment statements can span multiple lines
      if (statement[0] === self.BEGIN_COMMENT) {
        // Consume Sass comments
        if (statement.substr(0, self.BEGIN_SASS_COMMENT.length) === self.BEGIN_SASS_COMMENT) {
          statement = void 0;
          while(this.getLevel(this.source[0]) > level) {
            this.source.shift();
            this.line++;
          }
          continue;
        } else
        // Build CSS comments
        if (statement.substr(0, self.BEGIN_CSS_COMMENT.length)  === self.BEGIN_CSS_COMMENT) {
          while(this.getLevel(this.source[0]) > level) {
            statement += '\n' + util.ltrim(this.source.shift());
            this.line++;
          }
        } else {
          this.source = statement;
          throw new Sass.Exception('Illegal comment type', [], this);
        }
      } else
      // Selector statements can span multiple lines
      if (statement.substr(-1) === SassRuleNode.CONTINUED) {
        // Build the selector statement
        while(this.getLevel(this.source[0]) === level) {
          statement += util.ltrim(this.source.shift());
          this.line++;
        }
      }

      token = {
        'source': statement,
        'level': level,
        'filename': this.filename,
        'line': this.line - 1
      };
    }
    return token;
  },

  /**
   * Returns the level of the line. Throws if the source indentation is invalid
   * Used for .sass source
   * @param {string} source - the source
   * @returns {number} the level of the source
   */
  getLevel: function(source) {
    var indent = source.length - util.ltrim(source).length;
    var level = indent / this.indentSpaces;
    if (typeof level == 'number' || source.substr(0, indent).indexOf(this.indentChar) === 0) {
      this.source = source;
      throw new Sass.Exception('Invalid indentation', {}, this);
    }
    return level;
  },

  /**
   * Returns an object that contains the next source statement and meta data
   * about it from SCSS source.
   * @returns {object} Statement token. Null if end of source.
   */
  scss2Token: function() {
    var self = this.constructor.prototype;
    var srcpos = 0; // current position in the source stream
    var srclen; // the length of the source stream

    var statement = '';
    var token = null;
    if (!srclen) {
      srclen = this.source.length;
    }
    while (!token && srcpos < srclen) {
      var c = this.source[srcpos++];
      switch (c) {
        case self.BEGIN_COMMENT:
          if (this.source.substr(srcpos-1, self.BEGIN_SASS_COMMENT.length) === self.BEGIN_SASS_COMMENT) {
            while (this.source[srcpos++] !== "\n") void 0;
            statement += "\n";
          } else
          if (this.source.substr(srcpos-1, self.BEGIN_CSS_COMMENT.length) === self.BEGIN_CSS_COMMENT) {
            if (util.ltrim(statement)) {
              throw new Sass.Exception('Invalid {what}', {'what': 'comment'}, {
                'source': statement,
                'filename': this.filename,
                'line': this.line
              });
            }
            statement += c + this.source[srcpos++];
            while (this.source.substr(srcpos, self.END_CSS_COMMENT.length) !== self.END_CSS_COMMENT) {
              statement += this.source[srcpos++];
            }
            srcpos += self.END_CSS_COMMENT.length;
            token = this.createToken(statement.self.END_CSS_COMMENT);
          } else {
            statement += c;
          }
          break;
        case self.DOUBLE_QUOTE:
        case self.SINGLE_QUOTE:
          statement += c;
          while (this.source[srcpos] !== c) {
            statement += this.source[srcpos++];
          }
          statement += this.source[srcpos++];
          break;
        case self.BEGIN_INTERPOLATION:
          statement += c;
          if (this.source.substr(srcpos-1, self.BEGIN_INTERPOLATION_BLOCK.length) === self.BEGIN_INTERPOLATION_BLOCK) {
            while (this.source[srcpos] !== self.END_BLOCK) {
              statement += this.source[srcpos++];
            }
            statement += this.source[srcpos++];
          }
          break;
        case self.BEGIN_BLOCK:
        case self.END_BLOCK:
        case self.END_STATEMENT:
          token = this.createToken(statement + c);
          if (!token) statement = '';
          break;
        default:
          statement += c;
          break;
      }
    }

    if (!token)
      srclen = srcpos = 0;

    return token;
  },

  /**
   * Returns an object that contains the source statement and meta data about
   * it.
   * If the statement is just and end block we update the meta data and return null.
   * @param {string} statement - source statement
   * @returns {SassToken}
   */
  createToken: function(statement) {
    var self = this.constructor.prototype;
    var level = 0;

    this.line += statement.split('\n').length - 1;
    statement = statement.trim();
    if (statement.substr(0, self.BEGIN_CSS_COMMENT.length) !== self.BEGIN_CSS_COMMENT) {
      statement = statement.replace(/[\r\n]/g, '');
    }
    var last = statement.substr(-1);
    // Trim the statement removing whitespace, end statement (;), begin block ({), and (unless the statement ends in an interpolation block) end block (})
    statement = util.rtrim(statement, ' '.self.BEGIN_BLOCK.self.END_STATEMENT);
    statement = (statement.match(/#\{.+?\}$/i) ? statement : util.rtrim(statement, self.END_BLOCK));
    var token = (statement ? {
      'source': statement,
      'level': level,
      'filename': this.filename,
      'line': this.line
    } : null);
    level += (last === self.BEGIN_BLOCK ? 1 : (last === self.END_BLOCK ? -1 : 0));
    return token;
  },

  /**
   * Parses a directive
   * @param {SassToken} token - token to parse
   * @param {SassNode} parent - parent node
   * @returns {SassNode} a Sass directive node
   */
  parseDirective: function(token, parent) {
    var i, source;
    switch (SassDirectiveNode.extractDirective(token)) {
      case '@extend':
        return new SassExtendNode(token);
      case '@mixin':
        return new SassMixinDefinitionNode(token);
      case '@include':
        return new SassMixinNode(token);
      case '@import':
        if (this.syntax == SassFile.SASS) {
          i = 0;
          source = '';
          while (this.source && !source) {
            source = this.source[i++];
          }
          if (source && this.getLevel(source) > token.level) {
            throw new Sass.Exception('Nesting not allowed beneath {what}', {'what': '@import directive'}, token);
          }
        }
        return new SassImportNode(token);
      case '@for':
        return new SassForNode(token);
      case '@if':
        return new SassIfNode(token);
      case '@else': // handles else and else if directives
        return new SassElseNode(token);
      case '@do':
      case '@while':
        return new SassWhileNode(token);
      case '@debug':
        return new SassDebugNode(token);
      case '@warn':
        return new SassDebugNode(token, true);
      default:
        return new SassDirectiveNode(token);
    }
  },

  /**
   * Determine the indent character and indent spaces.
   * The first character of the first indented line determines the character.
   * If this is a space the number of spaces determines the indentSpaces; this
   * is always 1 if the indent character is a tab.
   * Only used for .sass files. Throws if the indent is mixed or
   * the indent character can not be determined
   */
  setIndentChar: function() {
    for (var l in this.source) {
      var source = this.source[l];
      if (source && ~this.indentChars.indexOf(source[0])) {
        this.indentChar = source[0];
        for  (var i = 0, len = source.length; i < len && source[i] == this.indentChar; i++);
        if (i < len && ~this.indentChars.indexOf(source.charAt(i))) {
          this.line = ++l;
          this.source = source;
          throw new Sass.Exception('Mixed indentation not allowed', {}, this);
        }
        this.indentSpaces = (this.indentChar == ' ' ? i : 1);
        return;
      }
    }
    this.indentChar = ' ';
    this.indentSpaces = 2;
  }
});
