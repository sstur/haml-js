"use strict";
var SassIfNode = require('./sass-if-node');

/**
 * @class SassElseNode
 * Represents Sass Else If and Else statements.
 * Else If and Else statement nodes are chained below the If statement node.
 */
var SassElseNode = module.exports = SassIfNode.extend({
  /**
   * SassElseNode constructor.
   * @param {object} token - source token
   * @return {SassElseNode}
   */
  init: function(token) {
    this._super(token, false);
  }
});
