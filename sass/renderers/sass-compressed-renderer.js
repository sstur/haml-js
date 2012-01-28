"use strict";
var SassRenderer = require('sass-renderer');

/**
 * @class SassCompressedRenderer
 * Compressed style takes up the minimum amount of space possible, having no
 * whitespace except that necessary to separate selectors and a newline at the
 * end of the file. It's not meant to be human-readable
 */
var SassCompressedRenderer = module.exports = SassRenderer.extend({
  /**
   * Renders the brace between the selectors and the properties
   * @returns {string} the brace between the selectors and the properties
   */
  between: function() {
    return '{';
  },

  /**
   * Renders the brace at the end of the rule
   * @returns {string} the brace between the rule and its properties
   */
  end: function() {
    return '}';
  },

  /**
   * Returns the indent string for the node
   * @param {SassNode} node - the node to return the indent string for
   * @returns {string} the indent string for this SassNode
   */
  getIndent: function(node) {
    return '';
  },

  /**
   * Renders a comment.
   * @param {SassNode} node - the node being rendered
   * @returns {string} the rendered comment
   */
  renderComment: function(node) {
    return '';
  },

  /**
   * Renders a directive.
   * @param {SassNode} node - the node being rendered
   * @param {Array} properties - properties of the directive
   * @returns {string} the rendered directive
   */
  renderDirective: function(node, properties) {
    return node.directive + this.between() + this.renderProperties(node, properties) + this.end();
  },

  /**
   * Renders properties.
   * @param {SassNode} node - the node being rendered
   * @param {Array} properties - properties to render
   * @returns {string} the rendered properties
   */
  renderProperties: function(node, properties) {
    return properties.join('');
  },

  /**
   * Renders a property.
   * @param {SassNode} node - the node being rendered
   * @return {string} the rendered property
   */
  renderProperty: function(node) {
    return node.name + ':' + node.value + ';';
  },

  /**
   * Renders a rule.
   * @param {SassNode} node - the node being rendered
   * @param {Array} properties - rule properties
   * @param {string} rules - rendered rules
   * @return {string} the rendered directive
   */
  renderRule: function(node, properties, rules) {
    return (properties ? this.renderSelectors(node) + this.between() + this.renderProperties(node, properties) + this.end() : '') + rules;
  },

  /**
   * Renders the rule's selectors
   * @param {SassNode} node - the node being rendered
   * @return {string} the rendered selectors
   */
  renderSelectors: function(node) {
    return node.selectors.join(',');
  }
});
