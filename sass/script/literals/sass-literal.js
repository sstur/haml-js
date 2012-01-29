"use strict";
var Class = require('../../../lib/class');

var Sass = require('../../sass');
var SassString = require('./sass-string');
var SassBoolean = require('./sass-boolean');
var SassScriptParser = require('../sass-script-parser');

/**
 * @class SassLiteral
 * Base class for all Sass literals.
 * Sass data types are extended from this class and these override the operation
 * methods to provide the appropriate semantics.
 */
var SassLiteral = module.exports = Class.extend({
  /**
   * @var array maps class names to data types
   */
  typeOf: {
    'SassBoolean' : 'bool',
    'SassColour'  : 'color',
    'SassNumber'  : 'number',
    'SassString'  : 'string'
  },

  /**
   * @var {string} the literal type (class)
   */
  type: 'SassLiteral',

  /**
   * @var mixed value of the literal type
   */
  value: null,

  /**
   * class constructor
   * @param {string} value - value of the literal type
   * @returns {SassLiteral}
   */
  init: function(value, context) {
    this.value = value;
    this.context = context;
  },

  /**
   * Getter.
   * @param {string} name - name of property to get
   * @returns {mixed} return value of getter function
   */
  __get: function(name) {
    throw new Sass.LiteralException('No getter function for {what}', {'what':name}, SassScriptParser.context.node);
  },

  /**
   * Returns the boolean representation of the value of this
   * @returns {boolean} the boolean representation of the value of this
   */
  toBoolean: function() {
    return !!this.value;
  },

  /**
   * Returns the type of this
   * @returns {string} the type of this
   */
  getTypeOf: function() {
    return this.typeOf[this.type] || 'none';
  },

  /**
   * Returns the value of this
   * @returns {mixed} the value of this
   */
  getValue: function() {
    throw new Sass.LiteralException('Child classes must override this method', {}, SassScriptParser.context.node);
  },

  /**
   * Adds a child object to this.
   * @param {SassLiteral} sassLiteral - the child object
   */
  addChild: function(sassLiteral) {
    this.children.push(sassLiteral);
  },

  /**
   * SassScript '+' operation.
   * @param {SassLiteral} other - value to add
   * @returns {SassString} the string values of this and other with no seperation
   */
  op_plus: function(other) {
    return new SassString(this.toString() + other.toString());
  },

  /**
   * SassScript '-' operation.
   * @param {SassLiteral} other - value to subtract
   * @returns {SassString} the string values of this and other seperated by '-'
   */
  op_minus: function(other) {
    return new SassString(this.toString() + '-' + other.toString());
  },

  /**
   * SassScript '*' operation.
   * @param {SassLiteral} other - value to multiply by
   * @returns {SassString} the string values of this and other seperated by '*'
   */
  op_times: function(other) {
    return new SassString(this.toString() + '*' + other.toString());
  },

  /**
   * SassScript '/' operation.
   * @param {SassLiteral} other - value to divide by
   * @returns {SassString} the string values of this and other seperated by '/'
   */
  op_div: function(other) {
    return new SassString(this.toString() + '/' + other.toString());
  },

  /**
   * SassScript '%' operation.
   * @param {SassLiteral} other - value to take the modulus of
   * @returns {SassLiteral} result
   * @throws {Exception} if modulo not supported for the data type
   */
  op_modulo: function(other) {
    throw new Sass.LiteralException('{class} does not support {operation}.', {'operation':Sass.t('sass', 'Modulus')}, SassScriptParser.context.node);
  },

  /**
   * Bitwise AND the value of other and this value
   * @param {string} other - value to bitwise AND with
   * @returns {string} result
   * @throws {Exception} if bitwise AND not supported for the data type
   */
  op_bw_and: function(other) {
    throw new Sass.LiteralException('{class} does not support {operation}.', {'operation':Sass.t('sass', 'Bitwise AND')}, SassScriptParser.context.node);
  },

  /**
   * Bitwise OR the value of other and this value
   * @param {SassNumber} other - value to bitwise OR with
   * @returns {string} result
   * @throws {Exception} if bitwise OR not supported for the data type
   */
  op_bw_or: function(other) {
    throw new Sass.LiteralException('{class} does not support {operation}.', {'operation':Sass.t('sass', 'Bitwise OR')}, SassScriptParser.context.node);
  },

  /**
   * Bitwise XOR the value of other and the value of this
   * @param {SassNumber} value to bitwise XOR with
   * @returns {string} result
   * @throws {Exception} if bitwise XOR not supported for the data type
   */
  op_bw_xor: function(other) {
    throw new Sass.LiteralException('{class} does not support {operation}.', {'operation':Sass.t('sass', 'Bitwise XOR')}, SassScriptParser.context.node);
  },

  /**
   * Bitwise NOT the value of other and the value of this
   * @param {SassNumber} other - value to bitwise NOT with
   * @returns {string} result
   * @throws {Exception} if bitwise NOT not supported for the data type
   */
  op_bw_not: function() {
    throw new Sass.LiteralException('{class} does not support {operation}.', {'operation':Sass.t('sass', 'Bitwise NOT')}, SassScriptParser.context.node);
  },

  /**
   * Shifts the value of this left by the number of bits given in value
   * @param {SassNumber} other - amount to shift left by
   * @returns {string} result
   * @throws {Exception} if bitwise Shift Left not supported for the data type
   */
  op_shiftl: function(other) {
    throw new Sass.LiteralException('{class} does not support {operation}.', {'operation':Sass.t('sass', 'Bitwise Shift Left')}, SassScriptParser.context.node);
  },

  /**
   * Shifts the value of this right by the number of bits given in value
   * @param {SassNumber} other - amount to shift right by
   * @returns {string} result
   * @throws {Exception} if bitwise Shift Right not supported for the data type
   */
  op_shiftr: function(other) {
    throw new Sass.LiteralException('{class} does not support {operation}.', {'operation':Sass.t('sass', 'Bitwise Shift Right')}, SassScriptParser.context.node);
  },

  /**
   * The SassScript and operation.
   * @param {SassLiteral} other - the value to and with this
   * @returns {SassLiteral} other if this is boolean true, this if false
   */
  op_and: function(other) {
    return (this.toBoolean() ? other : this);
  },

  /**
   * The SassScript or operation.
   * @param {SassLiteral} other - the value to or with this
   * @returns {SassLiteral} this if this is boolean true, other if false
   */
  op_or: function(other) {
    return (this.toBoolean() ? this : other);
  },

  /**
   * The SassScript xor operation.
   * @param {SassLiteral} other - the value to xor with this
   * @returns {SassBoolean} SassBoolean object with the value true if this or
   * other, but not both, are true, false if not
   */
  op_xor: function(other) {
    return new SassBoolean(this.toBoolean() ? !other.toBoolean() : other.toBoolean());
  },

  /**
   * The SassScript not operation.
   * @returns {SassBoolean} SassBoolean object with the value true if the
   * boolean of this is false or false if it is true
   */
  op_not: function() {
    return new SassBoolean(!this.toBoolean());
  },

  /**
   * The SassScript > operation.
   * @param {SassLiteral} other - the value to compare to this
   * @returns {SassBoolean} SassBoolean object with the value true if the values
   * of this is greater than the value of other, false if it is not
   */
  op_gt: function(other) {
    return new SassBoolean(this.value > other.value);
  },

  /**
   * The SassScript >= operation.
   * @param {SassLiteral} other - the value to compare to this
   * @returns {SassBoolean} SassBoolean object with the value true if the values
   * of this is greater than or equal to the value of other, false if it is not
   */
  op_gte: function(other) {
    return new SassBoolean(this.value >= other.value);
  },

  /**
   * The SassScript < operation.
   * @param {SassLiteral} other - the value to compare to this
   * @returns {SassBoolean} SassBoolean object with the value true if the values
   * of this is less than the value of other, false if it is not
   */
  op_lt: function(other) {
    return new SassBoolean(this.value < other.value);
  },

  /**
   * The SassScript <= operation.
   * @param {SassLiteral} other - the value to compare to this
   * @returns {SassBoolean} SassBoolean object with the value true if the values
   * of this is less than or equal to the value of other, false if it is not
   */
  op_lte: function(other) {
    return new SassBoolean(this.value <= other.value);
  },

  /**
   * The SassScript == operation.
   * @param {SassLiteral} other - the value to compare to this
   * @returns {SassBoolean} SassBoolean object with the value true if this and
   * other are equal, false if they are not
   */
  op_eq: function(other) {
    return new SassBoolean(this == other);
  },

  /**
   * The SassScript != operation.
   * @param {SassLiteral} other - the value to compare to this
   * @returns {SassBoolean} SassBoolean object with the value true if this and
   * other are not equal, false if they are
   */
  op_neq: function(other) {
    return new SassBoolean(!this.op_eq(other).toBoolean());
  },

  /**
   * The SassScript default operation (e.g. a b, "foo" "bar").
   * @param {SassLiteral} other - the value to concatenate with a space to this
   * @returns {SassString} the string values of this and other seperated by " "
   */
  op_concat: function(other) {
    return new SassString(this.toString() + ' ' + other.toString());
  },

  /**
   * SassScript ',' operation.
   * @param {SassLiteral} other - the value to concatenate with a comma to this
   * @returns {SassString} the string values of this and other separated by ","
   */
  op_comma: function(other) {
    return new SassString(this.toString() + ', ' + other.toString());
  },

  /**
   * Asserts that the literal is the expected type
   * @param {SassLiteral} literal - the literal to test
   * @param {string} type - expected type
   * @throws {ScriptFunctionException} if value is not the expected type
   */
  assertType: function(literal, type) {
    if (!literal instanceof type) {
      throw new Sass.ScriptFunctionException('{what} must be a {type}', {'what':(literal instanceof SassLiteral ? literal.typeOf : 'literal'), 'type':type}, SassScriptParser.context.node);
    }
  },

  /**
   * Asserts that the value of a literal is within the expected range
   * @param {SassLiteral} literal - the literal to test
   * @param {number} min - the minimum value
   * @param {number} max - the maximum value
   * @param {string} units - the units.
   * @throws {ScriptFunctionException} if value is not the expected type
   */
  assertInRange: function(literal, min, max, units) {
    units = units || '';
    if (literal.value < min || literal.value > max) {
      throw new Sass.ScriptFunctionException('{what} must be {inRange}', {'what':literal.typeOf, 'inRange':Sass.t('sass', 'between {min} and {max} inclusive', {'min':min.units, 'max':max.units})}, SassScriptParser.context.node);
    }
  },

  /**
   * Returns a string representation of the value.
   * @returns {string} string representation of the value.
   */
  toString: function() {},

  /**
   * Returns a value indicating if a token of this type can be matched at
   * the start of the subject string.
   * @param {string} subject - the subject string
   * @returns {string|boolean} match at the start of the string or false if no match
   */
  isa: function(subject) {}
});
