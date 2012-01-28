"use strict";
var util = require('../../lib/util');

var SassRuleNode = require('../tree/sass-rule-node');
var SassCompressedRenderer = require('./sass-compressed-renderer');

/**
 * $class SassCompactRenderer
 * Each CSS rule takes up only one line, with every property defined on that
 * line. Nested rules are placed next to each other with no newline, while
 * groups of rules have newlines between them.
 */
var SassCompactRenderer = module.exports = SassCompressedRenderer.extend({
  DEBUG_INFO_RULE: '@media -sass-debug-info',
  DEBUG_INFO_PROPERTY: 'font-family',

  /**
   * Renders the brace between the selectors and the properties
   * @returns {string} the brace between the selectors and the properties
   */
  between: function() {
    return ' { ';
  },

  /**
   * Renders the brace at the end of the rule
   * @returns {string} the brace between the rule and its properties
   */
  end: function() {
    return " }\n";
  },

  /**
   * Renders a comment.
   * Comments preceeding a rule are on their own line.
   * Comments within a rule are on the same line as the rule.
   * @param {SassNode} node - the node being rendered
   * @returns {string} the rendered commnt
   */
  renderComment: function(node) {
    var nl = (node.parent instanceof SassRuleNode ? '' : '\n');
    return nl + "/* " + node.children.join("\n * ") + ' */' + nl;
  },

  /**
   * Renders a directive.
   * @param {SassNode} node - the node being rendered
   * @param {Object} properties - properties of the directive
   * @returns {string} the rendered directive
   */
  renderDirective: function(node, properties) {
    return util.replace(this._super(node, properties), '\n', '') + '\n\n';
  },

  /**
   * Renders properties.
   * @param {SassNode} node - the node being rendered
   * @param {Array} properties - properties to render
   * @returns {string} the rendered properties
   */
  renderProperties: function(node, properties) {
    return properties.join(' ');
  },

  /**
   * Renders a property.
   * @param {SassNode} node - the node being rendered
   * @returns {string} the rendered property
   */
  renderProperty: function(node) {
    return node.name + ': ' + node.value + ';';
  },

  /**
   * Renders a rule.
   * @param {SassNode} node - the node being rendered
   * @param {Array} properties - rule properties
   * @param {string} rules - rendered rules
   * @returns {string} the rendered rule
   */
  renderRule: function(node, properties, rules) {
    return this.renderDebug(node) + this._super(node, properties, rules.replace(/\n\n/g, '\n')) + '\n';
  },

  /**
   * Renders debug information.
   * If the node has the debug_info options set true the line number and filename
   * are rendered in a format compatible with
   * [FireSass](https://addons.mozilla.org/en-US/firefox/addon/103988/).
   * Else if the node has the line_numbers option set true the line number and
   * filename are rendered in a comment.
   * @param {SassNode} node - the node being rendered
   * @returns {string} the debug information
   */
  renderDebug: function(node) {
    var indent = this.getIndent(node);
    var debug = '';

    if (node.debug_info) {
      debug  = indent + self.DEBUG_INFO_RULE + '{';
      debug += 'filename{' + self.DEBUG_INFO_PROPERTY + ':' + ('file://' + node.filename).replace(/([^-\w])/g, '\\$1') + ';}';
      debug += 'line{' + self.DEBUG_INFO_PROPERTY + ":'" + node.line + "';}";
      debug += '}\n';
    } else
    if (node.line_numbers) {
      debug += indent + '/* line ' + node.line + ' ' + node.filename + ' */\n';
    }
    return debug;
  },

  /**
   * Renders rule selectors.
   * @param {SassNode} node - the node being rendered
   * @returns {string} the rendered selectors
   */
  renderSelectors: function(node) {
    return node.selectors.join(', ');
  }
});
