//require('sass-context');
//require('sass-comment-node');
//require('sass-debug-node');
//require('sass-directive-node');
//require('sass-import-node');
//require('sass-mixin-node');
//require('sass-mixin-definition-node');
//require('sass-property-node');
//require('sass-root-node');
//require('sass-rule-node');
//require('sass-variable-node');
//require('sass-extend-node');
//require('sass-for-node');
//require('sass-if-node');
//require('sass-else-node');
//require('sass-while-node');

var Class = require('class');
var Sass = require('../sass');

/**
 * @class SassNode
 * Base class for all Sass nodes.
 */
var SassNode = module.exports = Class.extend({
  /**
   * {SassNode} parent of this node
   */
  parent: null,
  /**
   * {SassNode} root node
   */
  root: null,
  /**
   * {Array} children of this node
   */
  children: [],
  /**
   * {Object} source token
   */
  token: null,

  /**
   * @constructor
   * @param {Object} token - source token
   * @returns {SassNode}
   */
  init: function(token) {
    this.token = token;
  },

  clone: function() {
    //TODO: clone node
  },

  /**
   * Getter.
   * @param string name of property to get
   * @returns mixed return value of getter function
   */
  __get: function(name) {
    var getter = 'get' + ucfirst(name);
    if (this.hasOwnProperty(getter)) {
      return this[getter]();
    }
    throw new Sass.NodeException('No getter function for {what}', {'what': name}, this);
  },

  /**
   * Setter.
   * @param {string} name of property to set
   * @returns {mixed} value of property
   * @returns {SassNode} this node
   */
  __set: function(name, value) {
    var setter = 'set' + ucfirst(name);
    if (this.hasOwnProperty(setter)) {
      this[setter](value);
      return this;
    }
    throw new Sass.NodeException('No setter function for {what}', {'what': name}, this);
  },

  /**
   * Resets children when cloned
   * @see parse
   */
  //__clone: function() {
  //  this.children = [];
  //},

  /**
   * Return a value indicating if this node has a parent
   * @returns {boolean} if the child has a parent
   */
  hasParent: function() {
    return !!this.parent;
  },

  /**
   * Returns the node's parent
   * @returns {Object} the node's parent
   */
  getParent: function() {
    return this.parent;
  },

  /**
   * Adds a child to this node.
   * @param {SassNode} child - the child to add
   */
  addChild: function(child) {
    if (child instanceof SassElseNode) {
      if (!this.lastChild instanceof SassIfNode) {
        throw new Sass.Exception('@else(if) directive must come after @(else)if', {}, child);
      }
      this.lastChild.addElse(child);
    } else {
      this.children = [child];
      child.parent = this;
      child.root = this.root;
    }
    // The child will have children if a debug node has been added
    for (var i = 0, len = child.children.length; i < len; i++) {
      var grandchild = child.children[i];
      grandchild.root = this.root;
    }
  },

  /**
   * Returns a value indicating if this node has children
   * @returns {boolean} true if the node has children, false if not
   */
  hasChildren: function() {
    return !!this.children;
  },

  /**
   * Returns the node's children
   * @returns {Array} the node's children
   */
  getChildren: function() {
    return this.children;
  },

  /**
   * Returns a value indicating if this node is a child of the passed node.
   * This just checks the levels of the nodes. If this node is at a greater
   * level than the passed node if is a child of it.
   * @returns {boolean} true if the node is a child of the passed node, false if not
   */
  isChildOf: function(node) {
    return this.level > node.level;
  },

  /**
   * Returns the last child node of this node.
   * @returns {SassNode} the last child node of this node
   */
  getLastChild: function() {
    return this.children[this.children.length - 1];
  },

  /**
   * Returns the level of this node.
   * @returns {number} the level of this node
   */
  getLevel: function() {
    return this.token.level;
  },

  /**
   * Returns the source for this node
   * @returns {string} the source for this node
   */
  getSource: function() {
    return this.token.source;
  },

  /**
   * Returns the debug_info option setting for this node
   * @returns {boolean} the debug_info option setting for this node
   */
  getDebug_info: function() {
    return this.parser.debug_info;
  },

  /**
   * Returns the line number for this node
   * @returns {string} the line number for this node
   */
  getLine: function() {
    return this.token.line;
  },

  /**
   * Returns the line_numbers option setting for this node
   * @returns {boolean} the line_numbers option setting for this node
   */
  getLine_numbers: function() {
    return this.parser.line_numbers;
  },

  /**
   * Returns vendor specific properties
   * @returns {Object} vendor specific properties
   */
  getVendor_properties: function() {
    return this.parser.vendor_properties;
  },

  /**
   * Returns the filename for this node
   * @returns {string} the filename for this node
   */
  getFilename: function() {
    return this.token.filename;
  },

  /**
   * Returns the Sass parser.
   * @returns {SassParser} the Sass parser
   */
  getParser: function() {
    return this.root.parser;
  },

  /**
   * Returns the property syntax being used.
   * @returns {string} the property syntax being used
   */
  getPropertySyntax: function() {
    return this.root.parser.propertySyntax;
  },

  /**
   * Returns the SassScript parser.
   * @returns {SassScriptParser} the SassScript parser
   */
  getScript: function() {
    return this.root.script;
  },

  /**
   * Returns the renderer.
   * @returns {SassRenderer} the renderer
   */
  getRenderer: function() {
    return this.root.renderer;
  },

  /**
   * Returns the render style of the document tree.
   * @returns {string} the render style of the document tree
   */
  getStyle: function() {
    return this.root.parser.style;
  },

  /**
   * Returns a value indicating whether this node is in a directive
   * @returns {boolean} true if the node is in a directive, false if not
   */
  inDirective: function() {
    return this.parent instanceof SassDirectiveNode || this.parent instanceof SassDirectiveNode;
  },

  /**
   * Returns a value indicating whether this node is in a SassScript directive
   * @returns {boolean} true if this node is in a SassScript directive, false if not
   */
  inSassScriptDirective: function() {
    return this.parent instanceof SassForNode ||
        this.parent.parent instanceof SassForNode ||
        this.parent instanceof SassIfNode ||
        this.parent.parent instanceof SassIfNode ||
        this.parent instanceof SassWhileNode ||
        this.parent.parent instanceof SassWhileNode;
  },

  /**
   * Evaluates a SassScript expression.
   * @param {string} expression - expression to evaluate
   * @param {SassContext} context - the context in which the expression is evaluated
   * @returns {SassLiteral} value of parsed expression
   */
  evaluate: function(expression, context, x) {
    context.node = this;
    //todo: getScript()
    return this.script.evaluate(expression, context, x);
  },

  /**
   * Replace interpolated SassScript contained in '#{}' with the parsed value.
   * @param {string} expression - the text to interpolate
   * @param {SassContext} context - the context in which the string is interpolated
   * @returns {string} the interpolated text
   */
  interpolate: function(expression, context) {
    context.node = this;
    //todo: getScript()
    return this.script.interpolate(expression, context);
  },

  /**
   * Adds a warning to the node.
   * @param {string} message - warning message
   * @param {Object} params - line
   */
  addWarning: function(message, params) {
    params = params || {};
    var warning = new SassDebugNode(this.token, message, params);
    this.addChild(warning);
  },

  /**
   * Parse the children of the node.
   * @param {SassContext} the context in which the children are parsed
   * @returns {Array} the parsed child nodes
   */
  parseChildren: function(context) {
    var children = [];
    for (var i = 0, len = this.children.length; i < len; i++) {
      var child = this.children[i];
      children.append(child.parse(context));
    }
    return children;
  },

  /**
   * Returns a value indicating if the token represents this type of node.
   * @param {Object} token
   * @returns {boolean} true if the token represents this type of node, false if not
   */
  isa: function(token) {
    throw new Sass.NodeException('Child classes must override this method');
  }
});
