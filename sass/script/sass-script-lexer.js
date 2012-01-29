"use strict";
var Class = require('../../lib/class');

var SassColour = require('./literals/sass-colour');
var SassNumber = require('./literals/sass-number');
var SassString = require('./literals/sass-string');
var SassBoolean = require('./literals/sass-boolean');
var SassScriptVariable = require('./sass-script-variable');
var SassScriptFunction = require('./sass-script-function');
var SassScriptOperation = require('./sass-script-operation');

/**
 * @class SassScriptLexer
 * Lexes SassScript into tokens for the parser.
 *
 * Implements a {@link http://en.wikipedia.org/wiki/Shunting-yard_algorithm Shunting-yard algorithm} to provide {@link http://en.wikipedia.org/wiki/Reverse_Polish_notation Reverse Polish notation} output.
 */
var SassScriptLexer = module.exports = Class.extend({
  MATCH_WHITESPACE: /^\s+/,

  /**
   * @var SassScriptParser the parser object
   */
  parser: null,

  /**
  * SassScriptLexer constructor.
  * @returns {SassScriptLexer}
  */
  init: function(parser) {
    this.parser = parser;
  },

  /**
   * Lex an expression into SassScript tokens.
   * @param {string} string - expression to lex
   * @param {SassContext} context - the context in which the expression is lexed
   * @returns {Array} tokens
   */
  lex: function(string, context) {
    var tokens = [];
    var match;
    while (string !== false) {
      if ((match = this.isWhitespace(string)) !== false) {
        tokens.push(null);
      } else
      if ((match = SassScriptFunction.isa(string)) !== false) {
        var matches = match.match(SassScriptFunction.MATCH_FUNC);

        var args = [];
        SassScriptFunction.extractArgs(matches[SassScriptFunction.ARGS]).forEach(function(expression) {
          args.push(this.parser.evaluate(expression, context));
        }, this);

        tokens.push(new SassScriptFunction(matches[SassScriptFunction.NAME], args));
      } else
      if ((match = SassString.isa(string)) !== false) {
        tokens.push(new SassString(match));
      } else
      if ((match = SassBoolean.isa(string)) !== false) {
        tokens.push(new SassBoolean(match));
      } else
      if ((match = SassColour.isa(string)) !== false) {
        tokens.push(new SassColour(match));
      } else
      if ((match = SassNumber.isa(string)) !== false) {
        tokens.push(new SassNumber(match));
      } else
      if ((match = SassScriptOperation.isa(string)) !== false) {
        tokens.push(new SassScriptOperation(match));
      } else
      if ((match = SassScriptVariable.isa(string)) !== false) {
        tokens.push(new SassScriptVariable(match));
      } else {
        var _string = string;
        match = '';
        (function() {
          while (_string.length && !this.isWhitespace(_string)) {
            var arr = SassScriptOperation.inStrOperators;
            for (var i = 0; i < arr.length; i++) {
              var operator = arr[i];
              if (_string.substr(0, operator.length) == operator) {
                return;
              }
            }
            match += _string[0];
            _string = _string.substr(1);
          }
        }).call(this);
        tokens.push(new SassString(match));
      }
      string = string.substr(match.length);
    }
    return tokens;
  },

  /**
   * Returns a value indicating if a token of this type can be matched at
   * the start of the subject string.
   * @param {string} subject - the subject string
   * @returns {number|boolean} match at the start of the string or false if no match
   */
  isWhitespace: function(subject) {
    var matches = subject.match(this.MATCH_WHITESPACE);
    return (matches ? matches[0] : false);
  }
});
