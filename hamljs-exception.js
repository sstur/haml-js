/**
 * HamlJS exception.
 * @copyright   Copyright (c) 2010 PBM Web Development
 * @license     see license.txt
 * @package     HamlJS
 */

require('./hamljs');

/**
 * HamlJS exception class.
 * Base class for HamlJS::Haml and HamlJS::Sass exceptions.
 * Translates exception messages.
 * @package     HamlJS
 */
var HamlException = Exception.extend({
  /**
   * Haml Exception.
   * @param string Category (haml|sass)
   * @param string Exception message
   * @param array parameters to be applied to the message using `strtr`.
   */
  init: function($category, $message, $params, $object) {
    this._super(this.t($category, $message, $params) +
        (is_object($object) ? ": " + $object.filename + "::" + $object.line + "\nSource: " + $object.source : ''));
  }
});
