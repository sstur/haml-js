var SassNode = require('./sass-node');

/**
 * @class SassExtendNode
 * Represents a Sass @debug or @warn directive.
 */
var SassExtendNode = module.exports = SassNode.extend({
  IDENTIFIER: '@',
  MATCH: /^@extend\s+(.+)/i,
  VALUE: 1,

  /**
   * @var string the directive
   */
  $value: null,

  /**
   * SassExtendNode.
   * @param {object} token - source token
   * @return {SassExtendNode}
   */
  init: function(token) {
    this._super(token);
    var matches = token.source.match(this.MATCH);
    this.value = matches[this.VALUE];
  },

  /**
   * Parse this node.
   * @return array An empty array
   */
  parse: function(context) {
    this.root.extend(this.value, this.parent.selectors);
    return [];
  }
});
