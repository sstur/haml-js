"use strict";
var SassExpandedRenderer = require('./sass-expanded-renderer');

/**
 * @class SassNestedRenderer
 * Nested style is the default Sass style, because it reflects the structure of
 * the document in much the same way Sass does. Each rule is indented based on
 * how deeply it's nested. Each property has its own line and is indented
 * within the rule.
 */
var SassNestedRenderer = module.exports = SassExpandedRenderer.extend({
  /**
   * Renders the brace at the end of the rule
   * @return string the brace between the rule and its properties
   */
  end: function() {
    return " }\n";
  },

  /**
   * Returns the indent string for the node
   * @param {SassNode} node - the node being rendered
   * @return {string} the indent string for this SassNode
   */
  getIndent: function(node) {
    return new Array(node.level + 1).join(this.INDENT);
  },

  /**
   * Renders a directive.
   * @param {SassNode} node - the node being rendered
   * @param {array} properties - properties of the directive
   * @return {string} the rendered directive
   */
  renderDirective: function(node, properties) {
    var directive = this.getIndent(node) + node.directive + this.between() + this.renderProperties(properties);
    return directive.replace(/(.*})\n$/, '$1') + this.end();
  },

  /**
   * Renders rule selectors.
   * @param {SassNode} node - the node being rendered
   * @return {string} the rendered selectors
   */
  renderSelectors: function(node) {
    var indent = this.getIndent(node);
    return indent.join(",\n" + indent, node.selectors);
  }
});
