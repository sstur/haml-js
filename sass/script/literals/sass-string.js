"use strict";
var Sass = require('../../sass');
var SassLiteral = require('./sass-literal');
var SassNumber = require('./sass-number');
var SassScriptParser = require('../sass-script-parser');

/**
 * @class SassString
 * Provides operations and type testing for Sass strings.
 */
var SassString = module.exports = SassLiteral.extend({
  MATCH: /^(((["\'])(.*)(\3))|(-[a-zA-Z][^\s]*))/i,
  _MATCH: /^(["\'])(.*?)(\1)?$/, // Used to match strings such as "Times New Roman",serif
  VALUE: 2,
  QUOTE: 3,

  /**
   * @var string string quote type; double or single quotes, or unquoted.
   */
  quote: null,

  /**
   * class constructor
   * @param {string} value
   * @returns {SassString}
   */
  init: function(value) {
    var matches = value.match(this._MATCH);
    if (matches[this.QUOTE]) {
      this.quote =  matches[this.QUOTE];
      this.value = matches[this.VALUE];
    } else {
      this.quote =  '';
      this.value = value;
    }
  },

  /**
   * String addition.
   * Concatenates this and other.
   * The resulting string will be quoted in the same way as this.
   * @param {SassString} other - string to add to this
   * @returns {SassString} the string result
   */
  op_plus: function(other) {
    if (!(other instanceof SassString)) {
      throw new Sass.StringException('{what} must be a {type}', {'what':Sass.t('sass', 'Value'), 'type':Sass.t('sass', 'string')}, SassScriptParser.context.node);
    }
    this.value += other.value;
    return this;
  },

  /**
   * String multiplication.
   * this is repeated other times
   * @param {SassNumber} other - the number of times to repeat this
   * @returns {SassString} the string result
   */
  op_times: function(other) {
    if (!(other instanceof SassNumber) || !other.isUnitless()) {
      throw new Sass.StringException('{what} must be a {type}', {'what':Sass.t('sass', 'Value'), 'type':Sass.t('sass', 'unitless number')}, SassScriptParser.context.node);
    }
    this.value = new Array(other.value + 1).join(this.value);
    return this;
  },

  /**
   * Returns the value of this string.
   * @returns {string} the string
   */
  getValue: function() {
    return this.value;
  },

  /**
   * Returns a string representation of the value.
   * @returns {string} string representation of the value.
   */
  toString: function() {
    return this.quote + this.value + this.quote;
  },

  toVar: function() {
    return SassScriptParser.context.getVariable(this.value);
  },

  /**
   * Returns a value indicating if a token of this type can be matched at
   * the start of the subject string.
   * @param {string} subject - the subject string
   * @returns {string|boolean} match at the start of the string or false if no match
   */
  isa: function(subject) {
    var matches = subject.match(this.MATCH);
    return (matches ? matches[0] : false);
  }
});
