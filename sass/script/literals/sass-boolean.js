"use strict";
var Sass = require('../../sass');
var SassLiteral = require('./sass-literal');
var SassScriptParser = require('../sass-script-parser');

/**
 * @class SassBoolean
 */
var SassBoolean = module.exports = SassLiteral.extend({
  /**@#+
   * Regex for matching and extracting booleans
   */
  MATCH: /^(true|false)\b/,

  /**
   * @var {string} the literal type (class)
   */
  type: 'SassBoolean',

  /**
   * SassBoolean constructor
   * @param {string} value - value of the boolean type
   * @return {SassBoolean}
   */
  init: function(value) {
    if (typeof value == 'boolean') {
      this.value = value;
    } else
    if (value === 'true' || value === 'false') {
      this.value = (value == 'true');
    } else {
      throw new Sass.BooleanException('Invalid {what}', {'what': 'SassBoolean'}, SassScriptParser.context.node);
    }
  },

  /**
   * Returns the value of this boolean.
   * @return {boolean} the value of this boolean
   */
  getValue: function() {
    return this.value;
  },

  /**
   * Returns a string representation of the value.
   * @return {string} string representation of the value.
   */
  toString: function() {
    return this.getValue() ? 'true' : 'false';
  },

  /**
   * Returns a value indicating if a token of this type can be matched at
   * the start of the subject string.
   * @param {string} subject - the subject string
   * @return {string|boolean} match at the start of the string or false if no match
   */
  isa: function(subject) {
    var matches = subject.match(this.MATCH);
    return (matches ? matches[0] : false);
  }
});
