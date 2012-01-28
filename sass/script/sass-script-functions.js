"use strict";
var util = require('../../lib/util');
var Class = require('../../lib/class');

var Sass = require('../sass');
var SassColour = require('./literals/sass-colour');
var SassNumber = require('./literals/sass-number');
var SassString = require('./literals/sass-string');
var SassBoolean = require('./literals/sass-boolean');
var SassLiteral = require('./literals/sass-literal');
var SassScriptParser = require('./sass-script-parser');

/**
 * @class SassScript
 * A collection of functions for use in SassScript.
 */
var SassScriptFunctions = module.exports = Class.extend({
  DECREASE: false,
  INCREASE: true,

  /*
   * Colour Creation
   */

  /**
   * Creates a SassColour object from red, green, and blue values.
   * @param SassNumber the red component.
   * A number between 0 and 255 inclusive, or between 0% and 100% inclusive
   * @param SassNumber the green component.
   * A number between 0 and 255 inclusive, or between 0% and 100% inclusive
   * @param SassNumber the blue component.
   * A number between 0 and 255 inclusive, or between 0% and 100% inclusive
   * @return new SassColour SassColour object
   * @throws ScriptFunctionException if red, green, or blue are out of bounds
   */
  rgb: function($red, $green, $blue) {
    return this.rgba($red, $green, $blue, new SassNumber(1));
  },

  /**
   * Creates a SassColour object from red, green, and blue values and alpha
   * channel (opacity).
   * There are two overloads:
   * * rgba(red, green, blue, alpha)
   * @param SassNumber the red component.
   * A number between 0 and 255 inclusive, or between 0% and 100% inclusive
   * @param SassNumber the green component.
   * A number between 0 and 255 inclusive, or between 0% and 100% inclusive
   * @param SassNumber the blue component.
   * A number between 0 and 255 inclusive, or between 0% and 100% inclusive
   * @param SassNumber The alpha channel. A number between 0 and 1.
   *
   * * rgba(colour, alpha)
   * @param SassColour a SassColour object
   * @param SassNumber The alpha channel. A number between 0 and 1.
   *
   * @return new SassColour SassColour object
   * @throws ScriptFunctionException if any of the red, green, or blue
   * colour components are out of bounds, or or the colour is not a colour, or
   * alpha is out of bounds
   */
  rgba: function() {
    switch (arguments.length) {
      case 2:
        var $colour = arguments[0];
        var $alpha = arguments[1];
        SassLiteral.assertType($colour, 'SassColour');
        SassLiteral.assertType($alpha, 'SassNumber');
        SassLiteral.assertInRange($alpha, 0, 1);
        return $colour['with']({'alpha': $alpha.value});
        break;
      case 4:
        var $rgba = [];
        var $components = Array.prototype.slice.call(arguments);
        $alpha = $components.pop();
        $components.forEach(function($component) {
          SassLiteral.assertType($component, 'SassNumber');
          if ($component.units == '%') {
            SassLiteral.assertInRange($component, 0, 100, '%');
            $rgba.push($component.value * 2.55);
          } else {
            SassLiteral.assertInRange($component, 0, 255);
            $rgba.push($component.value);
          }
        }, this);
        SassLiteral.assertType($alpha, 'SassNumber');
        SassLiteral.assertInRange($alpha, 0, 1);
        $rgba.push($alpha.value);
        return new SassColour($rgba);
        break;
      default:
        throw new Sass.ScriptFunctionException('Incorrect argument count for {method}; expected {expected}, received {received}', {'{expected}': '2 or 4', '{received}': arguments.length}, SassScriptParser.context.node);
    }
  },

  /**
   * Creates a SassColour object from hue, saturation, and lightness.
   * Uses the algorithm from the
   * {@link http://www.w3.org/TR/css3-colour/#hsl-colour CSS3 spec}.
   * @param float The hue of the colour in degrees.
   * Should be between 0 and 360 inclusive
   * @param mixed The saturation of the colour as a percentage.
   * Must be between '0%' and 100%, inclusive
   * @param mixed The lightness of the colour as a percentage.
   * Must be between 0% and 100%, inclusive
   * @return new SassColour The resulting colour
   * @throws ScriptFunctionException if saturation or lightness are out of bounds
   */
  hsl: function($h, $s, $l) {
    return this.hsla($h, $s, $l, new SassNumber(1));
  },

  /**
   * Creates a SassColour object from hue, saturation, lightness and alpha
   * channel (opacity).
   * @param SassNumber The hue of the colour in degrees.
   * Should be between 0 and 360 inclusive
   * @param SassNumber The saturation of the colour as a percentage.
   * Must be between 0% and 100% inclusive
   * @param SassNumber The lightness of the colour as a percentage.
   * Must be between 0% and 100% inclusive
   * @param float The alpha channel. A number between 0 and 1.
   * @return new SassColour The resulting colour
   * @throws ScriptFunctionException if saturation, lightness or alpha are
   * out of bounds
   */
  hsla: function($h, $s, $l, $a) {
    SassLiteral.assertType($h, 'SassNumber');
    SassLiteral.assertType($s, 'SassNumber');
    SassLiteral.assertType($l, 'SassNumber');
    SassLiteral.assertType($a, 'SassNumber');
    SassLiteral.assertInRange($s, 0, 100, '%');
    SassLiteral.assertInRange($l, 0, 100, '%');
    SassLiteral.assertInRange($a, 0,   1);
    return new SassColour({'hue': $h, 'saturation': $s, 'lightness': $l, 'alpha': $a});
  },

  /*
   * Colour Information
   */

  /**
   * Returns the red component of a colour.
   * @param SassColour The colour
   * @return new SassNumber The red component of colour
   * @throws ScriptFunctionException If $colour is not a colour
   */
  red: function($colour) {
    SassLiteral.assertType($colour, 'SassColour');
    return new SassNumber($colour.red);
  },

  /**
   * Returns the green component of a colour.
   * @param SassColour The colour
   * @return new SassNumber The green component of colour
   * @throws ScriptFunctionException If $colour is not a colour
   */
  green: function($colour) {
    SassLiteral.assertType($colour, 'SassColour');
    return new SassNumber($colour.green);
  },

  /**
   * Returns the blue component of a colour.
   * @param SassColour The colour
   * @return new SassNumber The blue component of colour
   * @throws ScriptFunctionException If $colour is not a colour
   */
  blue: function($colour) {
    SassLiteral.assertType($colour, 'SassColour');
    return new SassNumber($colour.blue);
  },

  /**
   * Returns the hue component of a colour.
   * @param SassColour The colour
   * @return new SassNumber The hue component of colour
   * @throws ScriptFunctionException If $colour is not a colour
   */
  hue: function($colour) {
    SassLiteral.assertType($colour, 'SassColour');
    return new SassNumber($colour.hue);
  },

  /**
   * Returns the saturation component of a colour.
   * @param SassColour The colour
   * @return new SassNumber The saturation component of colour
   * @throws ScriptFunctionException If $colour is not a colour
   */
  saturation: function($colour) {
    SassLiteral.assertType($colour, 'SassColour');
    return new SassNumber($colour.saturation);
  },

  /**
   * Returns the lightness component of a colour.
   * @param SassColour The colour
   * @return new SassNumber The lightness component of colour
   * @throws ScriptFunctionException If $colour is not a colour
   */
  lightness: function($colour) {
    SassLiteral.assertType($colour, 'SassColour');
    return new SassNumber($colour.lightness);
  },

  /**
   * Returns the alpha component (opacity) of a colour.
   * @param SassColour The colour
   * @return new SassNumber The alpha component (opacity) of colour
   * @throws ScriptFunctionException If $colour is not a colour
   */
  alpha: function($colour) {
    SassLiteral.assertType($colour, 'SassColour');
    return new SassNumber($colour.alpha);
  },

  /**
   * Returns the alpha component (opacity) of a colour.
   * @param SassColour The colour
   * @return new SassNumber The alpha component (opacity) of colour
   * @throws ScriptFunctionException If $colour is not a colour
   */
  opacity: function($colour) {
    SassLiteral.assertType($colour, 'SassColour');
    return new SassNumber($colour.alpha);
  },

  /*
   * Colour Adjustments
   */

  /**
   * Changes the hue of a colour while retaining the lightness and saturation.
   * @param SassColour The colour to adjust
   * @param SassNumber The amount to adjust the colour by
   * @return new SassColour The adjusted colour
   * @throws ScriptFunctionException If $colour is not a colour or
   * $degrees is not a number
   */
  adjust_hue: function($colour, $degrees) {
    SassLiteral.assertType($colour, 'SassColour');
    SassLiteral.assertType($degrees, 'SassNumber');
    return $colour['with']({'hue': $colour.hue + $degrees.value});
  },

  /**
   * Makes a colour lighter.
   * @param SassColour The colour to lighten
   * @param SassNumber The amount to lighten the colour by
   * @param SassBoolean Whether the amount is a proportion of the current value
   * (true) or the total range (false).
   * The default is false - the amount is a proportion of the total range.
   * If the colour lightness value is 40% and the amount is 50%,
   * the resulting colour lightness value is 90% if the amount is a proportion
   * of the total range, whereas it is 60% if the amount is a proportion of the
   * current value.
   * @return new SassColour The lightened colour
   * @throws ScriptFunctionException If $colour is not a colour or
   * $amount is not a number
   * @see lighten_rel
   */
  lighten: function($colour, $amount, $ofCurrent) {
    $ofCurrent = $ofCurrent || false;
    return this.adjust($colour, $amount, $ofCurrent, 'lightness', this.INCREASE, 0, 100, '%');
  },

  /**
   * Makes a colour darker.
   * @param SassColour The colour to darken
   * @param SassNumber The amount to darken the colour by
   * @param SassBoolean Whether the amount is a proportion of the current value
   * (true) or the total range (false).
   * The default is false - the amount is a proportion of the total range.
   * If the colour lightness value is 80% and the amount is 50%,
   * the resulting colour lightness value is 30% if the amount is a proportion
   * of the total range, whereas it is 40% if the amount is a proportion of the
   * current value.
   * @return new SassColour The darkened colour
   * @throws ScriptFunctionException If $colour is not a colour or
   * $amount is not a number
   * @see adjust
   */
  darken: function($colour, $amount, $ofCurrent) {
    $ofCurrent = $ofCurrent || false;
    return this.adjust($colour, $amount, $ofCurrent, 'lightness', this.DECREASE, 0, 100, '%');
  },

  /**
   * Makes a colour more saturated.
   * @param SassColour The colour to saturate
   * @param SassNumber The amount to saturate the colour by
   * @param SassBoolean Whether the amount is a proportion of the current value
   * (true) or the total range (false).
   * The default is false - the amount is a proportion of the total range.
   * If the colour saturation value is 40% and the amount is 50%,
   * the resulting colour saturation value is 90% if the amount is a proportion
   * of the total range, whereas it is 60% if the amount is a proportion of the
   * current value.
   * @return new SassColour The saturated colour
   * @throws ScriptFunctionException If $colour is not a colour or
   * $amount is not a number
   * @see adjust
   */
  saturate: function($colour, $amount, $ofCurrent) {
    $ofCurrent = $ofCurrent || false;
    return this.adjust($colour, $amount, $ofCurrent, 'saturation', this.INCREASE, 0, 100, '%');
  },

  /**
   * Makes a colour less saturated.
   * @param SassColour The colour to desaturate
   * @param SassNumber The amount to desaturate the colour by
   * @param SassBoolean Whether the amount is a proportion of the current value
   * (true) or the total range (false).
   * The default is false - the amount is a proportion of the total range.
   * If the colour saturation value is 80% and the amount is 50%,
   * the resulting colour saturation value is 30% if the amount is a proportion
   * of the total range, whereas it is 40% if the amount is a proportion of the
   * current value.
   * @return new SassColour The desaturateed colour
   * @throws ScriptFunctionException If $colour is not a colour or
   * $amount is not a number
   * @see adjust
   */
  desaturate: function($colour, $amount, $ofCurrent) {
    $ofCurrent = $ofCurrent || false;
    return this.adjust($colour, $amount, $ofCurrent, 'saturation', this.DECREASE, 0, 100, '%');
  },

  /**
   * Makes a colour more opaque.
   * @param SassColour The colour to opacify
   * @param SassNumber The amount to opacify the colour by
   * If this is a unitless number between 0 and 1 the adjustment is absolute,
   * if it is a percentage the adjustment is relative.
   * If the colour alpha value is 0.4
   * if the amount is 0.5 the resulting colour alpha value  is 0.9,
   * whereas if the amount is 50% the resulting colour alpha value  is 0.6.
   * @return new SassColour The opacified colour
   * @throws ScriptFunctionException If $colour is not a colour or
   * $amount is not a number
   * @see opacify_rel
   */
  opacify: function($colour, $amount, $ofCurrent) {
    $ofCurrent = $ofCurrent || false;
    var $units = this.units($amount);
    return this.adjust($colour, $amount, $ofCurrent, 'alpha', this.INCREASE, 0, ($units === '%' ? 100 : 1), $units);
  },

  /**
   * Makes a colour more transparent.
   * @param SassColour The colour to transparentize
   * @param SassNumber The amount to transparentize the colour by.
   * If this is a unitless number between 0 and 1 the adjustment is absolute,
   * if it is a percentage the adjustment is relative.
   * If the colour alpha value is 0.8
   * if the amount is 0.5 the resulting colour alpha value  is 0.3,
   * whereas if the amount is 50% the resulting colour alpha value  is 0.4.
   * @return new SassColour The transparentized colour
   * @throws ScriptFunctionException If $colour is not a colour or
   * $amount is not a number
   */
  transparentize: function($colour, $amount, $ofCurrent) {
    $ofCurrent = $ofCurrent || false;
    var $units = this.units($amount);
    return this.adjust($colour, $amount, $ofCurrent, 'alpha', this.DECREASE, 0, ($units === '%' ? 100 : 1), $units);
  },

  /**
   * Makes a colour more opaque.
   * Alias for {@link opacify}.
   * @param SassColour The colour to opacify
   * @param SassNumber The amount to opacify the colour by
   * @param SassBoolean Whether the amount is a proportion of the current value
   * (true) or the total range (false).
   * @return new SassColour The opacified colour
   * @throws ScriptFunctionException If $colour is not a colour or
   * $amount is not a number
   * @see opacify
   */
  fade_in: function($colour, $amount, $ofCurrent) {
    $ofCurrent = $ofCurrent || false;
    return this.opacify($colour, $amount, $ofCurrent);
  },

  /**
   * Makes a colour more transparent.
   * Alias for {@link transparentize}.
   * @param SassColour The colour to transparentize
   * @param SassNumber The amount to transparentize the colour by
   * @param SassBoolean Whether the amount is a proportion of the current value
   * (true) or the total range (false).
   * @return new SassColour The transparentized colour
   * @throws ScriptFunctionException If $colour is not a colour or
   * $amount is not a number
   * @see transparentize
   */
  fade_out: function($colour, $amount, $ofCurrent) {
    $ofCurrent = $ofCurrent || false;
    return this.transparentize($colour, $amount, $ofCurrent);
  },

  /**
   * Returns the complement of a colour.
   * Rotates the hue by 180 degrees.
   * @param SassColour The colour
   * @return new SassColour The comlemented colour
   * @uses adjust_hue()
   */
  complement: function($colour) {
    return this.adjust_hue($colour, new SassNumber('180deg'));
  },

  /**
   * Greyscale for non-english speakers.
   * @param SassColour The colour
   * @return new SassColour The greyscale colour
   * @see desaturate
   */
  grayscale: function($colour) {
    return this.desaturate($colour, new SassNumber(100));
  },

  /**
   * Converts a colour to greyscale.
   * Reduces the saturation to zero.
   * @param SassColour The colour
   * @return new SassColour The greyscale colour
   * @see desaturate
   */
  greyscale: function($colour) {
    return this.desaturate($colour, new SassNumber(100));
  },

  /**
   * Mixes two colours together.
   * Takes the average of each of the RGB components, optionally weighted by the
   * given percentage. The opacity of the colours is also considered when
   * weighting the components.
   * The weight specifies the amount of the first colour that should be included
   * in the returned colour. The default, 50%, means that half the first colour
   * and half the second colour should be used. 25% means that a quarter of the
   * first colour and three quarters of the second colour should be used.
   * For example:
   *   mix(#f00, #00f) => #7f007f
   *   mix(#f00, #00f, 25%) => #3f00bf
   *   mix(rgba(255, 0, 0, 0.5), #00f) => rgba(63, 0, 191, 0.75)
   *
   * @param SassColour The first colour
   * @param SassColour The second colour
   * @param float Percentage of the first colour to use
   * @return new SassColour The mixed colour
   * @throws ScriptFunctionException If $colour1 or $colour2 is
   * not a colour
   */
  mix: function($colour1, $colour2, $weight) {
    if ($weight == null) $weight = new SassNumber('50%');
    SassLiteral.assertType($colour1, 'SassColour');
    SassLiteral.assertType($colour2, 'SassColour');
    SassLiteral.assertType($weight, 'SassNumber');
    SassLiteral.assertInRange($weight, 0, 100, '%');

    /*
     * This algorithm factors in both the user-provided weight
     * and the difference between the alpha values of the two colours
     * to decide how to perform the weighted average of the two RGB values.
     *
     * It works by first normalizing both parameters to be within [-1, 1],
     * where 1 indicates "only use colour1", -1 indicates "only use colour 0",
     * and all values in between indicated a proportionately weighted average.
     *
     * Once we have the normalized variables w and a,
     * we apply the formula (w + a)/(1 + w*a)
     * to get the combined weight (in [-1, 1]) of colour1.
     * This formula has two especially nice properties:
     *
     * * When either w or a are -1 or 1, the combined weight is also that number
     *  (cases where w * a == -1 are undefined, and handled as a special case).
     *
     * * When a is 0, the combined weight is w, and vice versa
     *
     * Finally, the weight of colour1 is renormalized to be within [0, 1]
     * and the weight of colour2 is given by 1 minus the weight of colour1.
     */

    var $p = $weight.value/100;
    var $w = $p * 2 - 1;
    var $a = $colour1.alpha - $colour2.alpha;

    var $w1 = ((($w * $a == -1) ? $w : ($w + $a)/(1 + $w * $a)) + 1) / 2;
    var $w2 = 1 - $w1;

    var $rgb1 = $colour1.rgb();
    var $rgb2 = $colour2.rgb();
    var $rgba = [];
    for (var $key in $rgb1) {
      var $value = $rgb1[$key];
      $rgba[$key] = $value * $w1 + $rgb2[$key] * $w2;
    }
    $rgba.push($colour1.alpha * $p + $colour2.alpha * (1 - $p));
    return new SassColour($rgba);
  },

  /**
   * Adjusts the colour
   * @param SassColour the colour to adjust
   * @param SassNumber the amount to adust by
   * @param boolean whether the amount is a proportion of the current value or
   * the total range
   * @param string the attribute to adjust
   * @param boolean whether to decrease (false) or increase (true) the value of the attribute
   * @param float minimum value the amount can be
   * @param float maximum value the amount can bemixed
   * @param string amount units
   */
  adjust: function ($colour, $amount, $ofCurrent, $attribute, $op, $min, $max, $units) {
    $units = $units || '';
    SassLiteral.assertType($colour, 'SassColour');
    SassLiteral.assertType($amount, 'SassNumber');
    SassLiteral.assertInRange($amount, $min, $max, $units);
    if (!(typeof $ofCurrent == 'boolean')) {
      SassLiteral.assertType($ofCurrent, 'SassBoolean');
      $ofCurrent = $ofCurrent.value;
    }

    $amount = $amount.value * (($attribute === 'alpha' && $ofCurrent && $units === '') ? 100 : 1);

    return $colour['with']({
      $attribute: this.inRange((
        $ofCurrent ?
        $colour.attribute * (1 + ($amount * ($op === this.INCREASE ? 1 : -1))/100) :
        $colour.attribute + ($amount * ($op === this.INCREASE ? 1 : -1))
      ), $min, $max)
    });
  },

  /*
   * Number Functions
   */

  /**
   * Finds the absolute value of a number.
   * For example:
   *     abs(10px) => 10px
   *     abs(-10px) => 10px
   *
   * @param SassNumber The number to round
   * @return SassNumber The absolute value of the number
   * @throws ScriptFunctionException If $number is not a number
   */
  abs: function($number) {
    SassLiteral.assertType($number, 'SassNumber');
    return new SassNumber(util.abs($number.value).number.units);
  },

  /**
   * Rounds a number up to the nearest whole number.
   * For example:
   *     ceil(10.4px) => 11px
   *     ceil(10.6px) => 11px
   *
   * @param SassNumber The number to round
   * @return new SassNumber The rounded number
   * @throws ScriptFunctionException If $number is not a number
   */
  ceil: function($number) {
    SassLiteral.assertType($number, 'SassNumber');
    return new SassNumber(util.ceil($number.value).number.units);
  },

  /**
   * Rounds down to the nearest whole number.
   * For example:
   *     floor(10.4px) => 10px
   *     floor(10.6px) => 10px
   *
   * @param SassNumber The number to round
   * @return new SassNumber The rounded number
   * @throws ScriptFunctionException If $value is not a number
   */
  floor: function($number) {
    SassLiteral.assertType($number, 'SassNumber');
    return new SassNumber(util.floor($number.value).number.units);
  },

  /**
   * Rounds a number to the nearest whole number.
   * For example:
   *     round(10.4px) => 10px
   *     round(10.6px) => 11px
   *
   * @param SassNumber The number to round
   * @return new SassNumber The rounded number
   * @throws ScriptFunctionException If $number is not a number
   */
  round: function($number) {
    SassLiteral.assertType($number, 'SassNumber');
    return new SassNumber(util.round($number.value).number.units);
  },

  /**
   * Returns true if two numbers are similar enough to be added, subtracted,
   * or compared.
   * @param SassNumber The first number to test
   * @param SassNumber The second number to test
   * @return new SassBoolean True if the numbers are similar
   * @throws ScriptFunctionException If $number1 or $number2 is not
   * a number
   */
  comparable: function($number1, $number2) {
    SassLiteral.assertType($number1, 'SassNumber');
    SassLiteral.assertType($number2, 'SassNumber');
    return new SassBoolean($number1.isComparableTo($number2));
  },

  /**
   * Converts a decimal number to a percentage.
   * For example:
   *     percentage(100px / 50px) => 200%
   *
   * @param SassNumber The decimal number to convert to a percentage
   * @return new SassNumber The number as a percentage
   * @throws ScriptFunctionException If $number isn't a unitless number
   */
  percentage: function($number) {
    if (!$number instanceof SassNumber || $number.hasUnits()) {
      throw new Sass.ScriptFunctionException('{what} must be a {type}', {'{what}': 'number', '{type}': 'unitless SassNumber'}, SassScriptParser.context.node);
    }
    $number.value *= 100;
    $number.units = '%';
    return $number;
  },

  /**
   * Inspects the unit of the number, returning it as a quoted string.
   * Alias for units.
   * @param SassNumber The number to inspect
   * @return new SassString The units of the number
   * @throws ScriptFunctionException If $number is not a number
   * @see units
   */
  unit: function($number) {
    return this.units($number);
  },

  /**
   * Inspects the units of the number, returning it as a quoted string.
   * @param SassNumber The number to inspect
   * @return new SassString The units of the number
   * @throws ScriptFunctionException If $number is not a number
   */
  units: function($number) {
    SassLiteral.assertType($number, 'SassNumber');
    return new SassString($number.units);
  },

  /**
   * Inspects the unit of the number, returning a boolean indicating if it is
   * unitless.
   * @param SassNumber The number to inspect
   * @return new SassBoolean True if the number is unitless, false if it has units.
   * @throws ScriptFunctionException If $number is not a number
   */
  unitless: function($number) {
    SassLiteral.assertType($number, 'SassNumber');
    return new SassBoolean(!$number.hasUnits());
  },

  /*
   * String Functions
   */

  /**
   * Add quotes to a string if the string isn't quoted,
   * or returns the same string if it is.
   * @param string String to quote
   * @return new SassString Quoted string
   * @throws ScriptFunctionException If $string is not a string
   * @see unquote
   */
  quote: function($string) {
    SassLiteral.assertType($string, 'SassString');
    return new SassString('"' + $string.value + '"');
  },

  /**
   * Removes quotes from a string if the string is quoted, or returns the same
   * string if it's not.
   * @param string String to unquote
   * @return new SassString Unuoted string
   * @throws ScriptFunctionException If $string is not a string
   * @see quote
   */
  unquote: function($string) {
    SassLiteral.assertType($string, 'SassString');
    return new SassString($string.value);
  },

  /**
   * Returns the variable whose name is the string.
   * @param string String to unquote
   * @return
   * @throws ScriptFunctionException If $string is not a string
   */
  get_var: function($string) {
    SassLiteral.assertType($string, 'SassString');
    return new SassString($string.toVar());
  },

  /*
   * Misc. Functions
   */

  /**
   * Inspects the type of the argument, returning it as an unquoted string.
   * @param SassLiteral The object to inspect
   * @return new SassString The type of object
   * @throws ScriptFunctionException If $obj is not an instance of a
   * SassLiteral
   */
  type_of: function($obj) {
    SassLiteral.assertType($obj, SassLiteral);
    return new SassString($obj.typeOf);
  },

  /**
   * Ensures the value is within the given range, clipping it if needed.
   * @param float the value to test
   * @param float the minimum value
   * @param float the maximum value
   * @return the value clipped to the range
   */
  inRange: function($value, $min, $max) {
      return ($value < $min ? $min : ($value > $max ? $max : $value));
  }
});
