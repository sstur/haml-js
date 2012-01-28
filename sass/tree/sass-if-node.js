"use strict";
var SassNode = require('./sass-node');

/**
 * @class SassIfNode
 * Represents Sass If, Else If and Else statements.
 * Else If and Else statement nodes are chained below the If statement node.
 */
var SassIfNode = module.exports = SassNode.extend({
  MATCH_IF: /^@if\s+(.+)$/,
  MATCH_ELSE: /@else(\s+if\s+(.+))?/i,
  IF_EXPRESSION: 1,
  ELSE_IF: 1,
  ELSE_EXPRESSION: 2,
  /**
   * @var SassIfNode the next else node.
   */
  'else': null,
  /**
   * @var string expression to evaluate
   */
  expression: null,

  /**
   * SassIfNode constructor.
   * @param {object} token - source token
   * @param {boolean} _if - true for an "if" node, false for an "else if | else" node
   * @return {SassIfNode}
   */
  init: function(token, _if) {
    var matches;
    if (_if == null) _if = true;
    this._super(token);
    if (_if) {
      matches = token.source.match(this.MATCH);
      this.expression = matches[this.IF_EXPRESSION];
    } else {
      matches = token.source.match(this.MATCH_ELSE);
      this.expression = (matches.length == 1) ? null : matches[this.ELSE_EXPRESSION];
    }
  },

  /**
   * Adds an "else" statement to this node.
   * @param {SassIfNode} node - "else" statement node to add
   * @return {SassIfNode} this node
   */
  addElse: function(node) {
    if (this['else'] == null) {
      node.parent = this.parent;
      node.root = this.root;
      this['else'] = node;
    } else {
      this['else'].addElse(node);
    }
    return this;
  },

  /**
   * Parse this node.
   * @param {SassContext} context - the context in which this node is parsed
   * @return {array} parsed child nodes
   */
  parse: function(context) {
    var children;
    if (this.isElse() || this.evaluate(this.expression, context).toBoolean()) {
      children = this.parseChildren(context);
    } else
    if (this['else']) {
      children = this['else'].parse(context);
    } else {
      children = [];
    }
    return children;
  },

  /**
   * Returns a value indicating if this node is an "else" node.
   * @return true if this node is an "else" node, false if this node is an "if"
   * or "else if" node
   */
  isElse: function() {
    return (this.expression == null);
  }
});
