/**
 * Sass exception.
 * @copyright   Copyright (c) 2010 PBM Web Development
 * @license     see license.txt
 * @package     HamlJS
 * @subpackage  Sass
 */

require('../hamljs-exception');

/**
 * Sass exception class.
 * @package     HamlJS
 * @subpackage  Sass
 */
var SassException = HamlJSException.extend({
  /**
   * Sass Exception.
   * @param string Exception message
   * @param array parameters to be applied to the message using `strtr`.
   * @param object object with source code and meta data
   */
  init: function($message, $params, $object) {
    this._super('sass', $message, $params, $object);
  }
});
