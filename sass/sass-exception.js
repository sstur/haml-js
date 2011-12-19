var HamlJS = require('./hamljs');
var Exception = require('../hamljs-exception');

/**
 * @class Sass exception
 * @extends HamlJS.Exception
 */
var SassException = module.exports = Exception.extend({
  /**
   * @param {String} message - Exception message
   * @param {Object} params - parameters to be applied to the message using `strtr`.
   * @param {Object} object - object with source code and meta data
   */
  init: function(message, params, object) {
    this._super('sass', message, params, object);
  }
});
