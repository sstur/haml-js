var Sass = require('../sass');
var SassNode = require('./sass-node');

/**
 * @class SassDebugNode
 * Represents a Sass @debug or @warn directive.
 */
var SassDebugNode = module.exports = SassNode.extend({
  IDENTIFIER: '@',
  MATCH: /^@(?:debug|warn)\s+(.+?)\s*;?$/,
  MESSAGE: 1,

  /**
   * @var {string} the debug/warning message
   */
  $message: null,
  /**
   * @var {array} parameters for the message;
   * only used by internal warning messages
   */
  $params: null,
  /**
   * @var {boolean} true if this is a warning
   */
  $warning: null,

  /**
   * SassDebugNode.
   * @param {object} token - source token
   * @param {mixed} string: an internally generated warning message about the source
   *                boolean: the source token is a @debug or @warn directive containing the message; True if
   *                this is a @warn directive
   * @param {Object} params - parameters for the message
   * @return {SassDebugNode}
   */
  init: function(token, message, params) {
    this._super(token);
    if (typeof message == 'string') {
      this.message = message;
      this.warning = true;
    } else {
      var matches = token.source.match(this.MATCH);
      this.message = matches[this.MESSAGE];
      this.warning = message;
    }
    this.params = params || {};
  },

  /**
   * Parse this node.
   * This raises an error.
   * @return {array} An empty array
   */
  parse: function() {
    if (!this.warning || (this.root.parser.quiet === false)) {
      //TODO: fix error handling
      //set_error_handler([this, 'errorHandler']);
      //trigger_error((this.warning ? this.interpolate(Sass.t('sass', this.message, this.params), ) : this.evaluate(Sass.t('sass', this.message, this.params), ).toString()));
      //restore_error_handler();
    }
    return [];
  },

  /**
   * Error handler for debug and warning statements.
   * @param {number} errno
   * @param {string} message
   */
  errorHandler: function(errno, message) {
    //'SASS ' + (this.warning ? 'WARNING' : 'DEBUG') + ': message; {this.filename}::{this.line}; Source: {this.source}';
  }
});
