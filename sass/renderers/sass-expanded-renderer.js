"use strict";
var SassCompactRenderer = require('./sass-compact-renderer');

/**
 * @class SassExpandedRenderer
 * Expanded is the typical human-made CSS style, with each property and rule
 * taking up one line. Properties are indented within the rules, but the rules
 * are not indented in any special way.
 */
var SassExpandedRenderer = module.exports = SassCompactRenderer.extend({
  /**
   * Renders the brace between the selectors and the properties
   * @returns {string} the brace between the selectors and the properties
   */
  between: function() {
    return " {\n" ;
  },

  /**
   * Renders the brace at the end of the rule
   * @returns {string} the brace between the rule and its properties
   */
  end: function() {
    return "\n}\n\n";
  },

  /**
   * Renders a comment.
   * @param {SassNode} node - the node being rendered
   * @returns {string} the rendered comment
   */
  renderComment: function(node) {
    var indent = this.getIndent(node);
    var lines = node.value.split("\n");
    for (var i = 0; i < lines.length; i++) {
      lines[i] = lines[i].trim();
    }
    return indent + "/*\n" + indent + " * " + lines.join("\n" + indent + " * ") + "\n" + indent + " */" + (!indent ? "\n" : '');
  },

  /**
   * Renders properties.
   * @param {SassNode} node - the node being rendered
   * @param {Array} properties - properties to render
   * @returns {string} the rendered properties
   */
  renderProperties: function(node, properties) {
    var indent = this.getIndent(node) + this.INDENT;
    return indent + properties.join("\n" + indent);
  }
});
