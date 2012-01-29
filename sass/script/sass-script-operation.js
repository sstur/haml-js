"use strict";
var Class = require('../../lib/class');

var Sass = require('../sass');
var SassScriptParser = require('./sass-script-parser');

/**
 * @class SassScriptOperation
 * The operation to perform.
 */
var SassScriptOperation = Class.extend({
  MATCH: /^(\(|\)|\+|-|\*|\/|%|<=|>=|<|>|==|!=|=|#\{|\}|,|and\b|or\b|xor\b|not\b)/,

  /**
   * @var array map symbols to tokens.
   * A token is function, associativity, precedence, number of operands
   */
  operators: {
    '*'    : ['times',   'l', 8, 2],
    '/'    : ['div',     'l', 8, 2],
    '%'    : ['modulo',  'l', 8, 2],
    '+'    : ['plus',    'l', 7, 2],
    '-'    : ['minus',   'l', 7, 2],
    '<<'   : ['shiftl',  'l', 6, 2],
    '>>'   : ['shiftr',  'l', 6, 2],
    '<='   : ['lte',     'l', 5, 2],
    '>='   : ['gte',     'l', 5, 2],
    '<'    : ['lt',      'l', 5, 2],
    '>'    : ['gt',      'l', 5, 2],
    '=='   : ['eq',      'l', 4, 2],
    '!='   : ['neq',     'l', 4, 2],
    'and'  : ['and',     'l', 3, 2],
    'or'   : ['or',      'l', 3, 2],
    'xor'  : ['xor',     'l', 3, 2],
    'not'  : ['not',     'l', 3, 1],
    '='    : ['assign',  'l', 2, 2],
    ')'    : ['rparen',  'l', 1],
    '('    : ['lparen',  'l', 0],
    ','    : ['comma',   'l', 0, 2],
    '\x23{': ['begin_interpolation'],
    '}'    : ['end_interpolation']
  },

  /**
   * @var array operators with meaning in uquoted strings;
   * selectors, property names and values
   */
  inStrOperators: [',', '#{'],

  /**
   * @var array default operator token.
   */
  defaultOperator: ['concat', 'l', 0, 2],

  /**
   * @var string operator for this operation
   */
  operator: null,
  /**
   * @var string associativity of the operator; left or right
   */
  associativity: null,
  /**
   * @var integer precedence of the operator
   */
  precedence: null,
  /**
   * @var integer number of operands required by the operator
   */
  operandCount: null,

  /**
   * SassScriptOperation constructor
   *
   * @param {string|Array} string: operator symbol; array: operator token
   * @returns SassScriptOperation
   */
  init: function(operation) {
    if (typeof operation == 'string') {
      operation = this.operators[operation];
    }
    this.operator = operation[0];
    if (operation[1]) {
      this.associativity = operation[1];
      this.precedence = operation[2];
      this.operandCount = ((operation[3]) ? operation[3] : null);
    }
  },

  /**
   * Getter function for properties
   * @param string name of property
   * @returns mixed value of the property
   * @throws SassScriptOperationException if the property does not exist
   */
  __get: function(name) {
    if (this[name]) {
      return this[name];
    } else {
      throw new Sass.ScriptOperationException('Unknown property: {name}', {'name': name}, SassScriptParser.context.node);
    }
  },

  /**
   * Performs this operation.
   * @param array operands for the operation. The operands are SassLiterals
   * @returns SassLiteral the result of the operation
   * @throws SassScriptOperationException if the oprand count is incorrect or
   * the operation is undefined
   */
  perform: function(operands) {
    var $operation;
    if (operands.length !== this.operandCount) {
      throw new Sass.ScriptOperationException('Incorrect operand count for {operation}; expected {expected}, received {received}', {'expected':this.operandCount, 'received':operands.length}, SassScriptParser.context.node);
    }

    if (operands.length > 1 && operands[1] == null) {
      $operation = 'op_unary_' + this.operator;
    } else {
      $operation = 'op_' + this.operator;
      if (this.associativity == 'l') {
        operands = operands.reverse();
      }
    }

    if (operands[0][$operation]) {
      return operands[0][$operation](operands[1] || null);
    }

    throw new Sass.ScriptOperationException('Undefined operation "{operation}" for {what}',  {'operation':$operation}, SassScriptParser.context.node);
  },

  /**
   * Returns a value indicating if a token of this type can be matched at
   * the start of the subject string.
   * @param string the subject string
   * @returns mixed match at the start of the string or false if no match
   */
  isa: function(subject) {
    var matches = subject.match(this.MATCH);
    return (matches ? matches[0].trim() : false);
  }
});
