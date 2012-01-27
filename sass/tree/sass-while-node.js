/**
 * @class SassWhileNode
 * Represents a Sass @while loop and a Sass @do loop.
 */
var SassWhileNode = module.exports = SassNode.extend({
  MATCH: /^@(do|while)\s+(.+)$/i,
  LOOP: 1,
  EXPRESSION: 2,
  IS_DO: 'do',
  /**
   * @var boolean whether this is a do/while.
   * A do/while loop is guaranteed to run at least once.
   */
  isDo: null,
  /**
   * @var string expression to evaluate
   */
  expression: null,

  /**
   * SassWhileNode constructor.
   * @param {object} token - source token
   * @return {SassWhileNode}
   */
  init: function(token) {
    this._super(token);
    var matches = token.source.match(this.MATCH);
    this.expression = matches[this.EXPRESSION];
    this.isDo = (matches[this.LOOP] === SassWhileNode.IS_DO);
  },

  /**
   * Parse this node.
   * @param {SassContext} context - the context in which this node is parsed
   * @return {array} the parsed child nodes
   */
  parse: function(context) {
    var children = [];
    if (this.isDo) {
      do {
        children = children.concat(this.parseChildren(context));
      } while (this.evaluate(this.expression, context));
    } else {
      while (this.evaluate(this.expression, context)) {
        children = children.concat(this.parseChildren(context));
      }
    }
    return children;
  }
});
