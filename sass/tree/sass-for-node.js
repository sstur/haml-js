"use strict";
var util = require('../../lib/util');

var Sass = require('../sass');
var SassNode = require('./sass-node');
var SassNumber = require('../script/literals/sass-number');
var SassContext = require('./sass-context');

/**
 * @class SassForNode
 * Represents a Sass @for loop.
 */
var SassForNode = module.exports = SassNode.extend({
  MATCH: /@for\s+[!\$](\w+)\s+from\s+(.+?)\s+(through|to)\s+(.+?)(?:\s+step\s+(.+))?$/i,

  VARIABLE: 1,
  FROM: 2,
  INCLUSIVE: 3,
  TO: 4,
  STEP: 5,
  IS_INCLUSIVE: 'through',

  /**
   * @var string variable name for the loop
   */
  variable: null,
  /**
   * @var string expression that provides the loop start value
   */
  from: null,
  /**
   * @var string expression that provides the loop end value
   */
  to: null,
  /**
   * @var boolean whether the loop end value is inclusive
   */
  inclusive: null,
  /**
   * @var string expression that provides the amount by which the loop variable
   * changes on each iteration
   */
  step: null,

  /**
   * SassForNode constructor.
   * @param {object} toke - source token
   * @return {SassForNode}
   */
  init: function(token) {
    this._super(token);
    var matches = token.source.match(this.MATCH);
    if (!matches) {
      throw new Sass.SassForNodeException('Invalid {what}', {'what': '@for directive'}, this);
    }
    this.variable  = matches[this.VARIABLE];
    this.from      = matches[this.FROM];
    this.to        = matches[this.TO];
    this.inclusive = (matches[this.INCLUSIVE] === this.IS_INCLUSIVE);
    this.step      = (!matches[this.STEP] ? 1 : matches[this.STEP]);
  },

  /**
   * Parse this node.
   * @param {SassContext} context - the context in which this node is parsed
   * @return {array} parsed child nodes
   */
  parse: function(context) {
    var children = [];
    var from = this.evaluate(this.from, context).value;
    var to = this.evaluate(this.to, context).value;
    var step = this.evaluate(this.step, context).value * (to > from ? 1 : -1);

    if (this.inclusive) {
      to += (from < to ? 1 : -1);
    }

    context = new SassContext(context);
    for (var i = from; (from < to ? i < to : i > to); i = i + step) {
      context.setVariable(this.variable, new SassNumber(i));
      util.array_merge(children, this.parseChildren(context));
    }
    return children;
  }
});
