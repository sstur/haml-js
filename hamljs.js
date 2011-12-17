/**
 * HamlJS.
 * @author			Chris Yates <chris.l.yates@gmail.com>
 * @copyright 	Copyright (c) 2010 PBM Web Development
 * @license			http://phamlp.googlecode.com/files/license.txt
 * @package			PHamlP
 */
/**
 * HamlJS class.
 * Static support classes.
 * @package     HamlJS
 */
var HamlJS = Class.extend({
  /**
   * @var string Language used to translate messages
   */
  $language: null,
  /**
   * @var array Messages used for translation
   */
  $messages: {},
  /**
   * Translates a message to the specified language.
   * @param string message category.
   * @param string the original message
   * @param array parameters to be applied to the message using `strtr`.
   * @return string the translated message
   */
  t: function($category, $message, $params) {
    if (this.$language != null) {
      $message = this.translate($category, $message);
    }
    return $params ? strtr($message, $params) : $message;
  },
  /**
   * Translates a message to the specified language.
   * If the language or the message in the specified language is not defined the
   * original message is returned.
   * @param string message category
   * @param string the original message
   * @return string the translated message
   */
  translate: function($category, $message) {
    if (this.$messages[$category] == null) this.loadMessages($category);
    return (!this.$messages[$category] || !this.$messages[$category][$message]) ? $message : this.$messages[$category][$message];
  },
  /**
   * Loads the specified language message file for translation.
   * Message files are files in the "category/messages" directory named
   * "language.js", where category is either haml or sass, and language is the
   * specified language.
   * The message file returns an array of (source, translation) pairs; for example:
   * ```
   * defineLanguage('en-AU', {
   *   'original message 1': 'translated message 1',
   *   'original message 2': 'translated message 2'
   * });
   * ```
   * @param string message category
   */
  loadMessages: function($category) {
    //var $messageFile = dirname(__filename) + DIRECTORY_SEPARATOR + $category + DIRECTORY_SEPARATOR + 'messages' + DIRECTORY_SEPARATOR + this.$language + '.js';
    //if (file_exists($messageFile)) {
    //  this.$messages[$category] = require_once($messageFile);
    //}
  }
});
