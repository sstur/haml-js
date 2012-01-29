"use strict";
var SassNode = require('./sass-node');

/**
 * @class SassDirectiveNode
 * Represents a CSS directive.
 */
var SassDirectiveNode = module.exports = SassNode.extend({
  NODE_IDENTIFIER: '@',
  MATCH: /^(@\w+)/,

  /**
   * SassDirectiveNode.
   * @param {Object} token - source token
   * @returns {SassDirectiveNode}
   */
  init: function(token) {
    this._super(token);
  },

  getDirective: function() {
    return this.extractDirective(this.token);
  },

  /**
   * Parse this node.
   * @param {SassContext} context - the context in which this node is parsed
   * @returns {Array} the parsed node
   */
  parse: function(context) {
    this.children = this.parseChildren(context);
    return [this];
  },

  /**
   * Render this node.
   * @returns {string} the rendered node
   */
  render: function() {
    var properties = [];
    for (var child in this.children) {
      properties.push(child.render());
    }

    return this.renderer.renderDirective(this, properties);
  },

  /**
   * Returns a value indicating if the token represents this type of node.
   * @param {Object} token
   * @returns {boolean} true if the token represents this type of node, false if not
   */
  isa: function(token) {
    return token.source.charAt(0) === this.NODE_IDENTIFIER;
  },

  /**
   * Returns the directive
   * @param {Object} token
   * @returns {string} the directive
   */
  extractDirective: function(token) {
    var matches = token.source.match(this.MATCH);
    return (matches[1]) ? matches[1].toLowerCase() : '';
  }
});
