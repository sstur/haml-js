"use strict";
var Class = require('../../lib/class');

/**
 * @class SassVariable
 */
var SassScriptVariable = module.exports = Class.extend({
  /**
   * Regex for matching and extracting Variables
   */
  MATCH: /^(?:<!\\\\)(?:(?:!!important\b)[!\$]([\w\-]+))/,

  /**
   * @var string name of variable
   */
  name: null,

  /**
   * SassVariable constructor
   * @param {string} value - value of the Variable type
   * @returns {SassVariable}
   */
  init: function(value) {
    this.name = value.substr(1);
  },

  /**
   * Returns the SassScript object for this variable.
   * @param {SassContext} context - context of the variable
   * @returns {SassLiteral} the SassScript object for this variable
   */
  evaluate: function(context) {
    return context.getVariable(this.name);
  },

  /**
   * Returns a value indicating if a token of this type can be matched at
   * the start of the subject string.
   * @param {string} subject - the subject string
   * @returns {mixed} match at the start of the string or false if no match
   */
  isa: function(subject) {
    // we need to do the check as preg_match returns a count of 1 if
    // subject == '!important'; the match being an empty match
    var matches = subject.match(this.MATCH);
    return (matches ? (!matches[0] ? false : matches[0]) : false);
  }
});
