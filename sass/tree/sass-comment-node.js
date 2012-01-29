"use strict";
var SassNode = require('./sass-node');

/**
 * @class SassCommentNode
 * Represents a CSS comment.
 */
var SassCommentNode = module.exports = SassNode.extend({
  NODE_IDENTIFIER: '/',
  MATCH: /^\/\*\s*(.*?)\s*(\*\/)?$/,
  COMMENT: 1,

  $value: null,

  /**
   * SassCommentNode constructor.
   * @param {Object} token - source token
   * @returns CommentNode
   */
  init: function(token) {
    this._super(token);
    var matches = token.source.match(this.MATCH);
    this.value = matches[this.COMMENT];
  },

  getValue: function() {
    return this.value;
  },

  /**
   * Parse this node.
   * @returns {Array} the parsed node - an empty array
   */
  parse: function(context) {
    return [this];
  },

  /**
   * Render this node.
   * @returns {string} the rendered node
   */
  render: function() {
    return this.renderer.renderComment(this);
  },

  /**
   * Returns a value indicating if the token represents this type of node.
   * @param {Object} token
   * @returns {boolean} true if the token represents this type of node, false if not
   */
  isa: function(token) {
    return token.source.charAt(0) === this.NODE_IDENTIFIER;
  }
});
