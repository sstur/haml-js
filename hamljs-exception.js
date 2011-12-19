var HamlJS = require('./hamljs');
var Class = require('./lib/class');

/**
 * @class Exception
 *
 * Base class for Haml Exception and Sass Exception
 * Translates and throws exceptions.
 */
HamlJS.Exception = module.exports = Class.extend({
  /**
   * @param {String} category - category (haml|sass)
   * @param {String} message - exception message
   * @param {Object} params - parameters to be applied to the message using `strtr`
   * @param {Object} object - object with source code and meta data
   */
  init: function(category, message, params, object) {
    throw new Error(HamlJS.t(category, message, params) + this.details(object));
  },
  /**
   * @private
   * @param {Object} object
   */
  details: function(object) {
    return (object) ? ": " + object.filename + "::" + object.line + "\nSource: " + object.source : '';
  }
});
