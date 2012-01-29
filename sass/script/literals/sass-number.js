"use strict";
var util = require('../../../lib/util');

var Sass = require('../../sass');
var SassColour = require('./sass-colour');
var SassLiteral = require('./sass-literal');
var SassBoolean = require('./sass-boolean');
var SassScriptParser = require('../sass-script-parser');

/**
 * @class SassNumber
 * Provides operations and type testing for Sass numbers.
 * Units are of the passed value are converted the those of the class value
 * if it has units. e.g. 2cm + 20mm = 4cm while 2 + 20mm = 22mm.
 */
var SassNumber = module.exports = SassLiteral.extend({
  /**
   * Regex for matching and extracting numbers
   */
  MATCH: /^((?:-)?(?:\d*\.)?\d+)(([a-z%]+)(\s*[\*\/]\s*[a-z%]+)*)?/i,
  VALUE: 1,
  UNITS: 2,
  /**
   * The number of decimal digits to round to.
   * If the units are pixels the result is always
   * rounded down to the nearest integer.
   */
  PRECISION: 4,

  /**
   * @var array Conversion factors for units using inches as the base unit
   * (only because pt and pc are expressed as fraction of an inch, so makes the
   * numbers easy to understand).
   * Conversions are based on the following
   * in: inches — 1 inch = 2.54 centimeters
   * cm: centimeters
   * mm: millimeters
   * pc: picas — 1 pica = 12 points
   * pt: points — 1 point = 1/72nd of an inch
   */
  unitConversion: {
    'in' : 1,
    'cm' : 2.54,
    'mm' : 25.4,
    'pc' : 6,
    'pt' : 72
  },

  /**
   * @var array numerator units of this number
   */
  numeratorUnits: [],

  /**
   * @var array denominator units of this number
   */
  denominatorUnits: [],
  
  /**
   * @var boolean whether this number is in an expression or a literal number
   * Used to determine whether division should take place 
   */
  inExpression: true,

  /**
   * class constructor.
   * Sets the value and units of the number.
   * @param {string} value - number
   * @return {SassNumber}
   */
  init: function(value) {
    var matches = value.match(this.MATCH);
    this.value = matches[this.VALUE];
    if (matches[this.UNITS]) {
      var units = matches[this.UNITS].split('/');
      var numeratorUnits = [], denominatorUnits = [];
      units[0].split('*').forEach(function(unit) {
        numeratorUnits.push(unit.trim());
      }, this);
      if (units[1]) {
        units[1].split('*').forEach(function(unit) {
          denominatorUnits.push(unit.trim());
        }, this);
      }
      units = this.removeCommonUnits(numeratorUnits, denominatorUnits);
      this.numeratorUnits = units[0];
      this.denominatorUnits = units[1];
    }
  },

  /**
   * Adds the value of other to the value of this
   * @param {SassNumber|SassColour} other - value to add
   * @return {SassNumber|SassColour} SassNumber if other is a SassNumber or
   * SassColour if it is a SassColour
   */
  op_plus: function(other) {
    if (other instanceof SassColour) {
      return other.op_plus(this);
    } else
    if (!other instanceof SassNumber) {
      throw new Sass.NumberException('{what} must be a {type}', {'what':Sass.t('sass', 'Number'), 'type':Sass.t('sass', 'number')}, SassScriptParser.context.node);
    } else {
      other = this.convert(other);
      return new SassNumber((this.value + other.value) + this.units);
    }
  },

  /**
   * Unary + operator
   * @return {SassNumber} the value of this number
   */
  op_unary_plus: function() {
    return this;
  },

  /**
   * Subtracts the value of other from this value
   * @param {SassNumber|SassColour} other - value to subtract
   * @return {SassNumber|SassColour} SassNumber if other is a SassNumber or
   * SassColour if it is a SassColour
   */
  op_minus: function(other) {
    if (other instanceof SassColour) {
      return other.op_minus(this);
    } else
    if (!other instanceof SassNumber) {
      throw new Sass.NumberException('{what} must be a {type}', {'what':Sass.t('sass', 'Number'), 'type':Sass.t('sass', 'number')}, SassScriptParser.context.node);
    } else {
      other = this.convert(other);
      return new SassNumber((this.value - other.value) + this.units);
    }
  },

  /**
   * Unary - operator
   * @return {SassNumber} the negative value of this number
   */
  op_unary_minus: function() {
    return new SassNumber((this.value * -1) + this.units);
  },

  /**
   * Multiplies this value by the value of other
   * @param {SassNumber|SassColour} other - value to multiply by
   * @return {SassNumber|SassColour} SassNumber if other is a SassNumber or
   * SassColour if it is a SassColour
   */
  op_times: function(other) {
    if (other instanceof SassColour) {
      return other.op_times(this);
    } else
    if (!other instanceof SassNumber) {
      throw new Sass.NumberException('{what} must be a {type}', {'what':Sass.t('sass', 'Number'), 'type':Sass.t('sass', 'number')}, SassScriptParser.context.node);
    } else {
      return new SassNumber((this.value * other.value) + this.unitString(
        util.array_merge(this.numeratorUnits, other.numeratorUnits),
          util.array_merge(this.denominatorUnits, other.denominatorUnits)
      ));
    }
  },

  /**
   * Divides this value by the value of other
   * @param {SassNumber|SassColour} other - value to divide by
   * @return {SassNumber|SassColour} SassNumber if other is a SassNumber or
   * SassColour if it is a SassColour
   */
  op_div: function(other) {
    if (other instanceof SassColour) {
      return other.op_div(this);
    } else
    if (!other instanceof SassNumber) {
      throw new Sass.NumberException('{what} must be a {type}', {'what':Sass.t('sass', 'Number'), 'type':Sass.t('sass', 'number')}, SassScriptParser.context.node);
    } else
    if (this.inExpression || other.inExpression) {
      return new SassNumber((this.value / other.value) + this.unitString(
        util.array_merge(this.numeratorUnits, other.denominatorUnits),
        util.array_merge(this.denominatorUnits, other.numeratorUnits)
      ));
    } else {
      return this._super(other);
    }
  },
  
  /**
   * The SassScript == operation.
   * @return {SassBoolean} SassBoolean object with the value true if the values
   * of this and other are equal, false if they are not
   */
  op_eq: function(other) {
    if (!other instanceof SassNumber) {
      return new SassBoolean(false);
    }
    try {
      return new SassBoolean(this.value == this.convert(other).value);
    } catch (e) {
      return new SassBoolean(false);
    }    
  },
  
  /**
   * The SassScript > operation.
   * @param {SassLiteral} other - the value to compare to this
   * @return {SassBoolean} SassBoolean object with the value true if the values
   * of this is greater than the value of other, false if it is not
   */
  op_gt: function(other) {
    if (!other instanceof SassNumber) {
      throw new Sass.NumberException('{what} must be a {type}', {'what':Sass.t('sass', 'Number'), 'type':Sass.t('sass', 'number')}, SassScriptParser.context.node);
    }
    return new SassBoolean(this.value > this.convert(other).value);
  },
  
  /**
   * The SassScript >= operation.
   * @param {SassLiteral} other - the value to compare to this
   * @return {SassBoolean} SassBoolean object with the value true if the values
   * of this is greater than or equal to the value of other, false if it is not
   */
  op_gte: function(other) {
    if (!other instanceof SassNumber) {
      throw new Sass.NumberException('{what} must be a {type}', {'what':Sass.t('sass', 'Number'), 'type':Sass.t('sass', 'number')}, SassScriptParser.context.node);
    }
    return new SassBoolean(this.value >= this.convert(other).value);
  },
  
  /**
   * The SassScript < operation.
   * @param {SassLiteral} other - the value to compare to this
   * @return {SassBoolean} SassBoolean object with the value true if the values
   * of this is less than the value of other, false if it is not
   */
  op_lt: function(other) {
    if (!other instanceof SassNumber) {
      throw new Sass.NumberException('{what} must be a {type}', {'what':Sass.t('sass', 'Number'), 'type':Sass.t('sass', 'number')}, SassScriptParser.context.node);
    }
    return new SassBoolean(this.value < this.convert(other).value);
  },
  
  /**
   * The SassScript <= operation.
   * @param {SassLiteral} other - the value to compare to this
   * @return {SassBoolean} SassBoolean object with the value true if the values
   * of this is less than or equal to the value of other, false if it is not
   */
  op_lte: function(other) {
    if (!other instanceof SassNumber) {
      throw new Sass.NumberException('{what} must be a {type}', {'what':Sass.t('sass', 'Number'), 'type':Sass.t('sass', 'number')}, SassScriptParser.context.node);
    }
    return new SassBoolean(this.value <= this.convert(other).value);
  },

  /**
   * Takes the modulus (remainder) of this value divided by the value of other
   * @param {string} other - value to divide by
   * @return {SassNumber|SassColour} SassNumber if other is a SassNumber or
   * SassColour if it is a SassColour
   */
  op_modulo: function(other) {
    if (!other instanceof SassNumber || !other.isUnitless()) {
      throw new Sass.NumberException('{what} must be a {type}', {'what':Sass.t('sass', 'Number'), 'type':Sass.t('sass', 'unitless number')}, SassScriptParser.context.node);
    }
    this.value %= this.convert(other).value;
    return this;
  },

  /**
   * Converts values and units.
   * If this is a unitless numeber it will take the units of other; if not
   * other is coerced to the units of this.
   * @param {SassNumber} other - the other number
   * @return {SassNumber} the other number with its value and units coerced if neccessary
   * @throws {NumberException} if the units are incompatible
   */
  convert: function(other) {
    if (this.isUnitless()) {
      this.numeratorUnits = other.numeratorUnits;
      this.denominatorUnits = other.denominatorUnits;
    }
    else {
      other = other.coerce(this.numeratorUnits, this.denominatorUnits);
    }
    return other;
  },
  
  /**
   * Returns the value of this number converted to other units.
   * The conversion takes into account the relationship between e.g. mm and cm,
   * as well as between e.g. in and cm.
   * 
   * If this number is unitless, it will simply return itself with the given units.
   * @param {array} numeratorUnits
   * @param {array} denominatorUnits
   * @return {SassNumber}
   */
  coerce: function(numeratorUnits, denominatorUnits) {
    return new SassNumber((this.isUnitless() ?
        this.value :
        this.value *
          this.coercionFactor(this.numeratorUnits, numeratorUnits) /
          this.coercionFactor(this.denominatorUnits, denominatorUnits)
    ) + numeratorUnits.join(' * ') + (denominatorUnits ? ' / ' + denominatorUnits.join(' * ') : ''));
  },
  
  /**
   * Calculates the corecion factor to apply to the value
   * @param {array} fromUnits - units being converted from
   * @param {array} toUnits - units being converted to
   * @return {number} the coercion factor to apply
   */
  coercionFactor: function(fromUnits, toUnits) {
    var units = this.removeCommonUnits(fromUnits, toUnits);
    fromUnits = units[0];
    toUnits = units[1];
    
    if (fromUnits.length !== toUnits.length || !this.areConvertable(util.array_merge(fromUnits, toUnits))) {
      throw new Sass.NumberException("Incompatible units: '{from}' and '{to}'", {'from':fromUnits.join(' * '), 'to':toUnits.join(' * ')}, SassScriptParser.context.node);
    }
    
    var coercionFactor = 1;
    for (var i in fromUnits) {
      var from = fromUnits[i];
      //todo: do we need to us hasOwnProperty?
      if (this.unitConversion[toUnits[i]] && this.unitConversion[from]) {
        coercionFactor *= this.unitConversion[toUnits[i]] / this.unitConversion[from];
      } else {
        throw new Sass.NumberException("Incompatible units: '{from}' and '{to}", {'from':fromUnits.join(' * '), 'to':toUnits.join(' * ')}, SassScriptParser.context.node);
      }
    }
    return coercionFactor;
  },
  
  /**
   * Returns a value indicating if all the units are capable of being converted
   * @param {array} units - units to test
   * @return {boolean} true if all units can be converted, false if not
   */
  areConvertable: function(units) {
    var convertable = Object.keys(this.unitConversion);
    units.forEach(function(unit) {
      if (convertable.indexOf(unit) < 0)
        return false;
    }, this);
    return true;
  },
  
  /**
   * Removes common units from each set.
   * We don't use array_diff because we want (for eaxmple) mm*mm/mm*cm to
   * end up as mm/cm. 
   * @param {array} u1 - first set of units
   * @param {array} u2 - second set of units
   * @return {array} both sets of units with common units removed
   */
  removeCommonUnits: function(u1, u2) {
    var _u1 = [];
    while (u1) {
      var u = u1.shift();
      var i = u2.indexOf(u);
      if (i >= 0) {
        delete u2[i];
      } else {
        _u1.push(u);
      }
    }
    return [_u1, u2];
  },

  /**
   * Returns a value indicating if this number is unitless.
   * @return {boolean} true if this number is unitless, false if not
   */
  isUnitless: function() {
    return !this.numeratorUnits && !this.denominatorUnits;
  },

  /**
   * Returns a value indicating if this number has units that can be represented
   * in CSS.
   * @return {boolean} true if this number has units that can be represented in
   * CSS, false if not
   */
  hasLegalUnits: function() {
    return (!this.numeratorUnits || this.numeratorUnits.length === 1) && !this.denominatorUnits;
  },

  /**
   * Returns a string representation of the units.
   * @return {string} the units
   */
  unitString: function(numeratorUnits, denominatorUnits) {
    return numeratorUnits.join(' * ') +
      (denominatorUnits ? ' / ' + denominatorUnits.join(' * ') : '');
  },

  /**
   * Returns the units of this number.
   * @return {string} the units of this number
   */
  getUnits: function() {
    return this.unitString(this.numeratorUnits, this.denominatorUnits);
  },

  /**
   * Returns the denominator units of this number.
   * @return {string} the denominator units of this number
   */
  getDenominatorUnits: function() {
    return this.denominatorUnits.join(' * ');
  },

  /**
   * Returns the numerator units of this number.
   * @return {string} the numerator units of this number
   */
  getNumeratorUnits: function() {
    return this.numeratorUnits.join(' * ');
  },
  
  /**
   * Returns a value indicating if this number can be compared to other.
   * @return {boolean} true if this number can be compared to other, false if not
   */
  isComparableTo: function(other) {
    try {
      this.op_plus(other);
      return true; 
    } catch (e) {
      return false; 
    }
  },

  /**
   * Returns a value indicating if this number is an integer.
   * @return {boolean} true if this number is an integer, false if not
   */
  isInt: function() {
    return this.value % 1 === 0;
  },

  /**
   * Returns the value of this number.
   * @return {number} the value of this number.
   */
  getValue: function() {
    return this.value;
  },

  /**
   * Returns the integer value.
    * @return {number} the integer value.
    * @throws {NumberException} if the number is not an integer
   */
  toInt: function() {
    if  (!this.isInt()) {
      throw new Sass.NumberException('Not an integer: {value}', {'value':this.value}, SassScriptParser.context.node);
    }
    return parseInt(this.value, 10);
  },

  /**
   * Converts the number to a string with it's units if any.
   * If the units are px the result is rounded down to the nearest integer,
   * otherwise the result is rounded to the specified precision.
    * @return {string} number as a string with it's units if any
   */
  toString: function() {
    if  (!this.hasLegalUnits()) {
      throw new Sass.NumberException('Invalid {what}', {'what':"CSS units ({this.units})"}, SassScriptParser.context.node);
    }
    return (this.units == 'px' ? Math.floor(this.value) : Math.round(this.value, this.PRECISION)) + this.units;
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
