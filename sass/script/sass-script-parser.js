"use strict";
var util = require('../../lib/util');
var Class = require('../../lib/class');

var Sass = require('../sass');
var SassNumber = require('./literals/sass-number');
var SassString = require('./literals/sass-string');
var SassLiteral = require();
var SassScriptLexer = require();
var SassScriptVariable = require();
var SassScriptFunction = require('./sass-script-function');
var SassScriptOperation = require('./sass-script-operation');

/**
 * @class SassScriptParser
 * Parses SassScript. SassScript is lexed into {@link http://en.wikipedia.org/wiki/Reverse_Polish_notation Reverse Polish notation} by the SassScriptLexer and
 *  the calculated result returned.
 */
var SassScriptParser = module.exports = Class.extend({
  MATCH_INTERPOLATION: /(?:<!\\\\)#\{(.*?)\}/g,
  DEFAULT_ENV: 0,
  CSS_RULE: 1,
  CSS_PROPERTY: 2,

  /**
   * @var {SassContext} Used for error reporting
   */
  context: null,

  /**
   * @var {SassScriptLexer} the lexer object
   */
  lexer: null,

  /**
  * SassScriptParser constructor.
  * @return {SassScriptParser}
  */
  init: function() {
    this.lexer = new SassScriptLexer(this);
  },

  /**
   * Replace interpolated SassScript contained in '#{}' with the parsed value.
   * @param {string} string - the text to interpolate
   * @param {SassContext} context - the context in which the string is interpolated
   * @return {string} the interpolated text
   */
  interpolate: function(string, context) {
    var matches = util.match_all(this.MATCH_INTERPOLATION, string);
    for (var i = 0, n = matches.length; i < n; i++) {
      matches[1][i] = this.evaluate(matches[1][i], context).toString();
    }
    return util.replace(string, matches[0], matches[1]);
  },

  /**
   * Evaluate a SassScript.
   * @param {string} expression - expression to parse
   * @param {SassContext} context - the context in which the expression is evaluated
   * @param  {integer} environment - the environment in which the expression is evaluated
   * @return {SassLiteral} parsed value
   */
  evaluate: function(expression, context, environment) {
    environment = environment || this.DEFAULT_ENV;
    this.context = context;
    var operands = [];

    var tokens = this.parse(expression, context, environment);

    while (tokens.length) {
      var token = tokens.shift();
      if (token instanceof SassScriptFunction) {
        operands.push(token.perform());
      } else
      if (token instanceof SassLiteral) {
        if (token instanceof SassString) {
          token = new SassString(this.interpolate(token.toString(), this.context));
        }
        operands.push(token);
      } else {
        var args = [];
        for (var i = 0, c = token.operandCount; i < c; i++) {
          args.push(operands.pop());
        }
        operands.push(token.perform(args));
      }
    }
    return operands.shift();
  },

  /**
   * Parse SassScript to a set of tokens in RPN
   * using the Shunting Yard Algorithm.
   * @param {string} expression - expression to parse
   * @param {SassContext} context - the context in which the expression is parsed
   * @param  {integer} environment - the environment in which the expression is parsed
   * @return {array} tokens in RPN
   */
  parse: function(expression, context, environment) {
    environment = environment || this.DEFAULT_ENV;
    var outputQueue = [];
    var operatorStack = [];
    var parenthesis = 0;

    var tokens = this.lexer.lex(expression, context);

    var c;
    for (var i in tokens) {
      var token = tokens[i];
      // If two literals/expessions are seperated by whitespace use the concat operator
      if (!token) {
        if (i > 0 && (!tokens[i-1] instanceof SassScriptOperation || tokens[i-1].operator === SassScriptOperation.operators[')'][0]) &&
            (!tokens[i+1] instanceof SassScriptOperation || tokens[i+1].operator === SassScriptOperation.operators['('][0])) {
          token = new SassScriptOperation(SassScriptOperation.defaultOperator, context);
        } else {
          continue;
        }
      } else
      if (token instanceof SassScriptVariable) {
        token = token.evaluate(context);
        environment = this.DEFAULT_ENV;
      }

      // If the token is a number or function add it to the output queue.
       if (token instanceof SassLiteral || token instanceof SassScriptFunction) {
         if (environment === this.CSS_PROPERTY && token instanceof SassNumber && !parenthesis) {
          token.inExpression = false;
         }
         outputQueue.push(token);
      } else
      // If the token is an operation
      if (token instanceof SassScriptOperation) {
        // If the token is a left parenthesis push it onto the stack.
        if (token.operator == SassScriptOperation.operators['('][0]) {
          operatorStack.push(token);
          parenthesis++;
        } else
        // If the token is a right parenthesis:
        if (token.operator == SassScriptOperation.operators[')'][0]) {
          parenthesis--;
          while (c = operatorStack.length) {
            // If the token at the top of the stack is a left parenthesis
            if (operatorStack[c - 1].operator == SassScriptOperation.operators['('][0]) {
              // Pop the left parenthesis from the stack, but not onto the output queue.
              operatorStack.pop();
              break;
            }
            // else pop the operator off the stack onto the output queue.
            outputQueue.push(operatorStack.pop());
          }
          // If the stack runs out without finding a left parenthesis
          // there are mismatched parentheses.
          if (c === 0) {
            throw new Sass.ScriptParserException('Unmatched parentheses', {}, context.node);
          }
        }
        // the token is an operator, o1, so:
        else {
          // while there is an operator, o2, at the top of the stack
          while (c = operatorStack.length) {
            var operation = operatorStack[c - 1];
            // if o2 is left parenthesis, or
            // the o1 has left associativty and greater precedence than o2, or
            // the o1 has right associativity and lower or equal precedence than o2
            if ((operation.operator == SassScriptOperation.operators['('][0]) ||
              (token.associativity == 'l' && token.precedence > operation.precedence) ||
              (token.associativity == 'r' && token.precedence <= operation.precedence)) {
              break; // stop checking operators
            }
            //pop o2 off the stack and onto the output queue
            outputQueue.push(operatorStack.pop());
          }
          // push o1 onto the stack
          operatorStack.push(token);
        }
      }
    }

    // When there are no more tokens
    while (c = operatorStack.length) { // While there are operators on the stack:
      if (operatorStack[c - 1].operator !== SassScriptOperation.operators['('][0]) {
        outputQueue.push(operatorStack.pop());
      } else {
        throw new Sass.ScriptParserException('Unmatched parentheses', {}, context.node);
      }
    }
    return outputQueue;
  }
});
