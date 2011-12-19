/*global strtr */
/**
 * @namespace HamlJS contains properties and static support methods
 *
 * @property {String} language - Language used to translate messages
 * @property {Object} messages - Messages used for translation
 *
 */
var HamlJS = exports.HamlJS = {
  language: null,
  messages: {},
  /**
   * Translates a message to the specified language.
   * @param {String} category - message category
   * @param {String} message - the original message
   * @param {Object} params - substitutions to be applied to the message
   * @returns {String} the translated message
   */
  t: function (category, message, params) {
    if (this.language) {
      message = this.translate(category, message);
    }
    return params ? strtr(message, params) : message;
  },
  /**
   * Translates a message to the specified language.
   * If the language or the message in the specified language is not defined the
   * original message is returned.
   * @param {String} category - message category
   * @param {String} message - the original message
   * @returns {String} the translated message
   */
  translate: function (category, message) {
    if (this.messages[category] == null) this.loadMessages(category);
    return (!this.messages[category] || !this.messages[category][message]) ? message : this.messages[category][message];
  },
  /**
   * Loads the specified language message file for translation.
   * Message files are files in the "category/messages" directory
   * where category is either haml or sass, and language is the specified language.
   * The message file defines a set of (source, translation) pairs; for example:
   * ```
   * defineLanguage('en-AU', {
   *   'original message 1': 'translated message 1',
   *   'original message 2': 'translated message 2'
   * });
   * ```
   * @param {String} category - message category
   */
  loadMessages: function (category) {
    //var messageFile = './' + category + '/' + 'messages/' + this.language + '.js';
    //if (file_exists(messageFile)) {
    //  this.messages[category] = loadLanguageFile(messageFile);
    //}
  }
};
