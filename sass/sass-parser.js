/**
 * SassParser class file.
 * See the [Sass documentation](http://sass-lang.com/docs)
 * for details of Sass.
 *
 * Credits:
 * This is a port of Sass from Ruby. All the genius comes from the people that
 * invented and develop Sass; in particular:
 * + [Hampton Catlin](http://hamptoncatlin.com/),
 * + [Nathan Weizenbaum](http://nex-3.com/),
 * + [Chris Eppstein](http://chriseppstein.github.com/)
 *
 * @copyright   Copyright (c) 2010 PBM Web Development
 * @license     see license.txt
 * @package     HamlJS
 * @subpackage  Sass
 */

require('./sass-file');
require('./sass-exception');
require('./tree/sass-node');

/**
 * SassParser class.
 * Parses {@link http://sass-lang.com/ .sass and .sccs} files.
 * @package     HamlJS
 * @subpackage  Sass
 */
var SassParser = Class.extend({
  /**#@+
   * Default option values
   */
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
   * @var string the character used for indenting
   * @see indentChars
   * @see indentSpaces
   */
  indentChar: null,
  /**
   * @var array allowable characters for indenting
   */
  indentChars: [' ', "\t"],
  /**
   * @var integer number of spaces for indentation.
   * Used to calculate `Level` if `indentChar` is space.
   */
  indentSpaces: 2,

  /**
   * @var string source
   */
  source: null,

  /**#@+
   * Option
   */
  /**
   * cache:
   * @var boolean Whether parsed Sass files should be cached, allowing greater
   * speed.
   *
   * Defaults to true.
   */
  cache: null,

  /**
   * cache_location:
   * @var string The path where the cached sassc files should be written to.
   *
   * Defaults to './sass-cache'.
   */
  cache_location: null,

  /**
   * css_location:
   * @var string The path where CSS output should be written to.
   *
   * Defaults to './css'.
   */
  css_location: null,

  /**
   * debug_info:
   * @var boolean When true the line number and file where a selector is defined
   * is emitted into the compiled CSS in a format that can be understood by the
   * [FireSass Firebug extension](https://addons.mozilla.org/en-US/firefox/addon/103988/)
   * Disabled when using the compressed output style.
   *
   * Defaults to false.
   * @see style
   */
  debug_info: null,

  /**
   * extensions:
   * @var array Sass extensions, e.g. Compass. An associative array of the form
   * $name => $options where $name is the name of the extension and $options
   * is an array of name=>value options pairs.
   */
  extensions: null,

  /**
   * filename:
   * @var string The filename of the file being rendered.
   * This is used solely for reporting errors.
   */
  filename: null,

  /**
   * function_paths:
   * @var array An array of filesystem paths which should be searched for
   * SassScript functions.
   */
  function_paths: null,

  /**
   * line:
   * @var integer The number of the first line of the Sass template. Used for
   * reporting line numbers for errors. This is useful to set if the Sass
   * template is embedded.
   *
   * Defaults to 1.
   */
  line: null,

  /**
   * line_numbers:
   * @var boolean When true the line number and filename where a selector is
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
   * load_paths:
   * @var array An array of filesystem paths which should be searched for
   * Sass templates imported with the @import directive.
   *
   * Defaults to './sass-templates'.
   */
  load_paths: null,

  /**
   * property_syntax:
   * @var string Forces the document to use one syntax for
   * properties. If the correct syntax isn't used, an error is thrown.
   * Value can be:
   * + new - forces the use of a colon or equals sign after the property name.
   * For example   color: #0f3 or width: $main_width.
   * + old -  forces the use of a colon before the property name.
   * For example: :color #0f3 or :width = $main_width.
   *
   * By default, either syntax is valid.
   *
   * Ignored for SCSS files which alaways use the new style.
   */
  property_syntax: null,

  /**
   * quiet:
   * @var boolean When set to true, causes warnings to be disabled.
   * Defaults to false.
   */
  quiet: null,

  /**
   * style:
   * @var string the style of the CSS output.
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
   * syntax:
   * @var string The syntax of the input file.
   * 'sass' for the indented syntax and 'scss' for the CSS-extension syntax.
   *
   * This is set automatically when parsing a file, else defaults to 'sass'.
   */
  syntax: null,

  /**
   * template_location:
   * @var string Path to the root sass template directory for your
   * application.
   */
  template_location: null,

  /**
   * vendor_properties:
   * If enabled a property need only be written in the standard form and vendor
   * specific versions will be added to the style sheet.
   * @var mixed array: vendor properties, merged with the built-in vendor
   * properties, to automatically apply.
   * Boolean true: use built in vendor properties.
   *
   * Defaults to vendor_properties disabled.
   * @see _vendorProperties
   */
  vendor_properties: [],

  /**#@-*/
  /**
   * Defines the build-in vendor properties
   * @var array built-in vendor properties
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
   * Constructor.
   * Sets parser options
   * @param array $options
   * @return SassParser
   */
  init: function($options) {
    if (!$options) {
      throw new SassException('{what} must be a {type}', {'what': 'options', 'type': 'array'});
    }
    if ($options['language']) {
      HamlJS.$language = $options['language'];
    }

    //TODO: make this non-blocking
    if ($options['extensions']) {
      for (var $extension in $options['extensions']) {
        var $extOptions = $options['extensions'][$extension];
        var $configClass = require(dirname(__filename) + DIRECTORY_SEPARATOR + 'extensions' + DIRECTORY_SEPARATOR + $extension + DIRECTORY_SEPARATOR + 'config');
        var $config = new $configClass;
        $config.config($extOptions);

        var $lp = dirname(__filename) + DIRECTORY_SEPARATOR + 'extensions' + DIRECTORY_SEPARATOR + $extension + DIRECTORY_SEPARATOR + 'frameworks';
        var $fp = dirname(__filename) + DIRECTORY_SEPARATOR + 'extensions' + DIRECTORY_SEPARATOR + $extension + DIRECTORY_SEPARATOR + 'functions';
        $options['load_paths'] = ($options['load_paths'] ? $options['load_paths'].concat([$lp]) : [$lp]);
        $options['function_paths'] = ($options['function_paths'] ? $options['function_paths'].concat([$fp]) : [$fp]);
      }
    }

    if ($options['vendor_properties']) {
      if ($options['vendor_properties'] === true) {
        this.vendor_properties = this._vendorProperties;
      } else
      if ($options['vendor_properties']) {
        this.vendor_properties = this.vendor_properties.concat(this._vendorProperties);
      }
    }
    //TODO: check this is right?
    //unset($options['language'], $options['vendor_properties']);
    delete $options['language'];
    delete $options['vendor_properties'];

    var $defaultOptions = {
      'cache': self.CACHE,
      'cache_location': dirname(__filename) + DIRECTORY_SEPARATOR + self.CACHE_LOCATION,
      'css_location': dirname(__filename) + DIRECTORY_SEPARATOR + self.CSS_LOCATION,
      'debug_info': false,
      'filename': {'dirname': '', 'basename': ''},
      'function_paths': [],
      'load_paths': [dirname(__filename) + DIRECTORY_SEPARATOR + self.TEMPLATE_LOCATION],
      'line': 1,
      'line_numbers': false,
      'style': SassRenderer.STYLE_NESTED,
      'syntax': SassFile.SASS
    };

    var obj = merge({}, $defaultOptions, $options);
    for (var $name in obj) {
      var $value = obj[$name];
      if (typeof this[$name] != 'undefined') {
        this[$name] = $value;
      }
    }
  },

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
   * @param string name of source file or Sass source
   * @return string CSS
   */
  toCss: function($source, $isFile) {
    if (typeof $isFile == 'undefined') $isFile = true;
    return this.parse($source, $isFile).render();
  },

  /**
   * Parse a sass file or Sass source code and
   * returns the document tree that can then be rendered.
   * The file will be searched for in the directories specified by the
   * load_paths option.
   * If caching is enabled a cached version will be used if possible or the
   * compiled version cached if not.
   * @param string name of source file or Sass source
   * @return SassRootNode Root node of document tree
   */
  parse: function($source, $isFile) {
    if (typeof $isFile == 'undefined') $isFile = true;
    if ($isFile) {
      this.filename = SassFile.getFile($source, this);

      if ($isFile) {
        this.syntax = substr(this.filename, -4);
      } else
      if (this.syntax !== SassFile.SASS && this.syntax !== SassFile.SCSS) {
        throw new SassException('Invalid {what}', {'what': 'syntax option'});
      }

      if (this.cache) {
        var $cached = SassFile.getCachedFile(this.filename, this.cache_location);
        if ($cached !== false) {
          return $cached;
        }
      }

      var $tree = this.toTree(file_get_contents(this.filename));

      if (this.cache) {
        SassFile.setCachedFile($tree, this.filename, this.cache_location);
      }

      return $tree;
    } else {
      return this.toTree($source);
    }
  },



  //TODO: make all methods below private




  /**
   * Parse Sass source into a document tree.
   * If the tree is already created return that.
   * @param string Sass source
   * @return SassRootNode the root of this document tree
   */
  toTree: function($source) {
    if (this.syntax === SassFile.SASS) {
      this.source = explode('\n', $source);
      this.setIndentChar();
    }
    else {
      this.source = $source;
    }
    unset($source);
    var $root = new SassRootNode(this);
    this.buildTree($root);
    return $root;
  },

  /**
   * Builds a parse tree under the parent node.
   * Called recursively until the source is parsed.
   * @param SassNode the node
   */
  buildTree: function($parent) {
    var $node = this.getNode($parent);
    while (is_object($node) && $node.isChildOf($parent)) {
      $parent.addChild($node);
      $node = this.buildTree($node);
    }
    return $node;
  },

  /**
   * Creates and returns the next SassNode.
   * The tpye of SassNode depends on the content of the SassToken.
   * @return SassNode a SassNode of the appropriate type. Null when no more
   * source to parse.
   */
  getNode: function($node) {
    var $token = this.getToken();
    if (!$token) return null;
    switch (true) {
      case SassDirectiveNode.isa($token):
        return this.parseDirective($token, $node);
        break;
      case SassCommentNode.isa($token):
        return new SassCommentNode($token);
        break;
      case SassVariableNode.isa($token):
        return new SassVariableNode($token);
        break;
      case SassPropertyNode.isa($token, this.property_syntax):
        return new SassPropertyNode($token, this.property_syntax);
        break;
      case SassMixinDefinitionNode.isa($token):
        if (this.syntax === SassFile.SCSS) {
          throw new SassException('Mixin {which} shortcut not allowed in SCSS', {'which': 'definition'}, this);
        }
        return new SassMixinDefinitionNode($token);
        break;
      case SassMixinNode.isa($token):
        if (this.syntax === SassFile.SCSS) {
          throw new SassException('Mixin {which} shortcut not allowed in SCSS', {'which': 'include'}, this);
        }
        return new SassMixinNode($token);
        break;
      default:
        return new SassRuleNode($token);
        break;
    } // switch
  },

  /**
   * Returns a token object that contains the next source statement and
   * meta data about it.
   * @return object
   */
  getToken: function() {
    return (this.syntax === SassFile.SASS ? this.sass2Token() : this.scss2Token());
  },

  /**
   * Returns an object that contains the next source statement and meta data
   * about it from SASS source.
   * Sass statements are passed over. Statements spanning multiple lines, e.g.
   * CSS comments and selectors, are assembled into a single statement.
   * @return object Statement token. Null if end of source.
   */
  sass2Token: function() {
    var $statement = ''; // source line being tokenized
    var $token = null;

    while (!$token && this.source) {
      while (!$statement && this.source) {
        var $source = this.source.shift();
        $statement = $source.trim();
        this.line++;
      }

      if (!$statement) {
        break;
      }

      var $level = this.getLevel($source);

      // Comment statements can span multiple lines
      if ($statement[0] === self.BEGIN_COMMENT) {
        // Consume Sass comments
        if (substr($statement, 0, self.BEGIN_SASS_COMMENT.length) === self.BEGIN_SASS_COMMENT) {
          $statement = void 0;
          while(this.getLevel(this.source[0]) > $level) {
            this.source.shift();
            this.line++;
          }
          continue;
        } else
        // Build CSS comments
        if (substr($statement, 0, strlen(self.BEGIN_CSS_COMMENT))  === self.BEGIN_CSS_COMMENT) {
          while(this.getLevel(this.source[0]) > $level) {
            $statement += '\n' + ltrim(this.source.shift());
            this.line++;
          }
        } else {
          this.source = $statement;
          throw new SassException('Illegal comment type', [], this);
        }
      } else
      // Selector statements can span multiple lines
      if (substr($statement, -1) === SassRuleNode.CONTINUED) {
        // Build the selector statement
        while(this.getLevel(this.source[0]) === $level) {
          $statement += ltrim(this.source.shift());
          this.line++;
        }
      }

      $token = {
        'source': $statement,
        'level': $level,
        'filename': this.filename,
        'line': this.line - 1
      };
    }
    return $token;
  },

  /**
   * Returns the level of the line.
   * Used for .sass source
   * @param string the source
   * @return integer the level of the source
   * @throws Exception if the source indentation is invalid
   */
  getLevel: function($source) {
    var $indent = $source.length - ltrim($source).length;
    var $level = $indent / this.indentSpaces;
    if (typeof $level == 'number' || substr($source, 0, $indent).indexOf(this.indentChar) == 0) {
      this.source = $source;
      throw new SassException('Invalid indentation', {}, this);
    }
    return $level;
  },

  /**
   * Returns an object that contains the next source statement and meta data
   * about it from SCSS source.
   * @return object Statement token. Null if end of source.
   */
  scss2Token: function() {
    var $srcpos = 0; // current position in the source stream
    var $srclen; // the length of the source stream

    var $statement = '';
    var $token = null;
    if (!$srclen) {
      $srclen = this.source.length;
    }
    while (!$token && $srcpos < $srclen) {
      $c = this.source[$srcpos++];
      switch ($c) {
        case self.BEGIN_COMMENT:
          if (substr(this.source, $srcpos-1, strlen(self.BEGIN_SASS_COMMENT)) === self.BEGIN_SASS_COMMENT) {
            while (this.source[$srcpos++] !== "\n") void 0;
            $statement += "\n";
          } else
          if (substr(this.source, $srcpos-1, strlen(self.BEGIN_CSS_COMMENT)) === self.BEGIN_CSS_COMMENT) {
            if (ltrim($statement)) {
              throw new SassException('Invalid {what}', {'what': 'comment'}, {
                'source': $statement,
                'filename': this.filename,
                'line': this.line
              });
            }
            $statement += $c + this.source[$srcpos++];
            while (substr(this.source, $srcpos, strlen(self.END_CSS_COMMENT)) !== self.END_CSS_COMMENT) {
              $statement += this.source[$srcpos++];
            }
            $srcpos += strlen(self.END_CSS_COMMENT);
            $token = this.createToken($statement.self.END_CSS_COMMENT);
          } else {
            $statement += $c;
          }
          break;
        case self.DOUBLE_QUOTE:
        case self.SINGLE_QUOTE:
          $statement += $c;
          while (this.source[$srcpos] !== $c) {
            $statement += this.source[$srcpos++];
          }
          $statement += this.source[$srcpos++];
          break;
        case self.BEGIN_INTERPOLATION:
          $statement += $c;
          if (substr(this.source, $srcpos-1, self.BEGIN_INTERPOLATION_BLOCK.length) === self.BEGIN_INTERPOLATION_BLOCK) {
            while (this.source[$srcpos] !== self.END_BLOCK) {
              $statement += this.source[$srcpos++];
            }
            $statement += this.source[$srcpos++];
          }
          break;
        case self.BEGIN_BLOCK:
        case self.END_BLOCK:
        case self.END_STATEMENT:
          $token = this.createToken($statement + $c);
          if (!$token) $statement = '';
          break;
        default:
          $statement += $c;
          break;
      }
    }

    if (!$token)
      $srclen = $srcpos = 0;

    return $token;
  },

  /**
   * Returns an object that contains the source statement and meta data about
   * it.
   * If the statement is just and end block we update the meta data and return null.
   * @param string source statement
   * @return SassToken
   */
  createToken: function($statement) {
    var $level = 0;

    this.line += substr_count($statement, '\n');
    $statement = trim($statement);
    if (substr($statement, 0, self.BEGIN_CSS_COMMENT.length) !== self.BEGIN_CSS_COMMENT) {
      $statement = $statement.replace(/[\r\n]/g, '');
    }
    var $last = substr($statement, -1);
    // Trim the statement removing whitespace, end statement (;), begin block ({), and (unless the statement ends in an interpolation block) end block (})
    $statement = rtrim($statement, ' '.self.BEGIN_BLOCK.self.END_STATEMENT);
    $statement = (preg_match('/#\{.+?\}$/i', $statement) ? $statement : rtrim($statement, self.END_BLOCK));
    var $token = ($statement ? {
      'source': $statement,
      'level': $level,
      'filename': this.filename,
      'line': this.line
    } : null);
    $level += ($last === self.BEGIN_BLOCK ? 1 : ($last === self.END_BLOCK ? -1 : 0));
    return $token;
  },

  /**
   * Parses a directive
   * @param SassToken token to parse
   * @param SassNode parent node
   * @return SassNode a Sass directive node
   */
  parseDirective: function($token, $parent) {
    var $i, $source;
    switch (SassDirectiveNode.extractDirective($token)) {
      case '@extend':
        return new SassExtendNode($token);
        break;
      case '@mixin':
        return new SassMixinDefinitionNode($token);
        break;
      case '@include':
        return new SassMixinNode($token);
        break;
      case '@import':
        if (this.syntax == SassFile.SASS) {
          $i = 0;
          $source = '';
          while (this.source && !$source) {
            $source = this.source[$i++];
          }
          if ($source && this.getLevel($source) > $token.level) {
            throw new SassException('Nesting not allowed beneath {what}', {'what': '@import directive'}, $token);
          }
        }
        return new SassImportNode($token);
        break;
      case '@for':
        return new SassForNode($token);
        break;
      case '@if':
        return new SassIfNode($token);
        break;
      case '@else': // handles else and else if directives
        return new SassElseNode($token);
        break;
      case '@do':
      case '@while':
        return new SassWhileNode($token);
        break;
      case '@debug':
        return new SassDebugNode($token);
        break;
      case '@warn':
        return new SassDebugNode($token, true);
        break;
      default:
        return new SassDirectiveNode($token);
        break;
    }
  },

  /**
   * Determine the indent character and indent spaces.
   * The first character of the first indented line determines the character.
   * If this is a space the number of spaces determines the indentSpaces; this
   * is always 1 if the indent character is a tab.
   * Only used for .sass files.
   * @throws SassException if the indent is mixed or
   * the indent character can not be determined
   */
  setIndentChar: function() {
    for (var $l in this.source) {
      var $source = this.source[$l];
      if ($source && in_array($source[0], this.indentChars)) {
        this.indentChar = $source[0];
        for  (var $i = 0, $len = $source.length; $i < $len && $source[$i] == this.indentChar; $i++);
        if ($i < $len && ~this.indentChars.indexOf($source.charAt($i))) {
          this.line = ++$l;
          this.source = $source;
          throw new SassException('Mixed indentation not allowed', {}, this);
        }
        this.indentSpaces = (this.indentChar == ' ' ? $i : 1);
        return;
      }
    }
    this.indentChar = ' ';
    this.indentSpaces = 2;
  }
});
