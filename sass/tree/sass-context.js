"use strict";
var util = require('../../lib/util');
var Class = require('../../lib/class');

var Sass = require('../sass');

/**
 * @class SassContext
 * Defines the context that the parser is operating in and so allows variables
 * to be scoped.
 * A new context is created for Mixins and imported files.
 */
var SassContext = module.exports = Class.extend({
  /**
   * @var SassContext enclosing context
   */
  parent: null,
  /**
   * @var array mixins defined in this context
   */
  mixins: [],
  /**
   * @var array variables defined in this context
   */
  variables: [],
  /**
   * @var SassNode the node being processed
   */
  node: null,

  /**
   * SassContext constructor.
   * @param {SassContext} parent - the enclosing context
   * @return {SassContext}
   */
  init: function(parent) {
    this.parent = parent;
  },

  /**
   * Adds a mixin
   * @param {string} name - name of mixin
   * @return {SassMixinDefinitionNode} the mixin
   */
  addMixin: function(name, mixin) {
    this.mixins[name] = mixin;
    return this;
  },

  /**
   * Returns a mixin
   * @param {string} name - name of mixin to return
   * @return {SassMixinDefinitionNode} the mixin
   * @throws {SassContextException} if mixin not defined in this context
   */
  getMixin: function(name) {
    if (this.mixins[name]) {
      return this.mixins[name];
    } else
    if (this.parent) {
      return this.parent.getMixin(name);
    }
    throw new Sass.ContextException('Undefined {what}: {name}', {'{what}': 'Mixin', '{name}': name}, this.node);
  },

  /**
   * Returns a variable defined in this context
   * @param {string} name - name of variable to return
   * @return {string} the variable
   * @throws {SassContextException} if variable not defined in this context
   */
  getVariable: function(name) {
    if (this.variables[name]) {
      return this.variables[name];
    } else
    if (this.parent) {
      return this.parent.getVariable(name);
    } else {
      throw new Sass.ContextException('Undefined {what}: {name}', {'{what}': 'Variable', '{name}': name}, this.node);
    }
  },

  /**
   * Returns a value indicating if the variable exists in this context
   * @param {string} name - name of variable to test
   * @return {boolean} true if the variable exists in this context, false if not
   */
  hasVariable: function(name) {
    return !!(this.variables[name]);
  },

  /**
   * Sets a variable to the given value
   * @param {string} name - name of variable
   * @param {sassLiteral} value - value of variable
   */
  setVariable: function(name, value) {
    this.variables[name] = value;
    return this;
  },

  /**
   * Makes variables and mixins from this context available in the parent context.
   * Note that if there are variables or mixins with the same name in the two
   * contexts they will be set to that defined in this context.
   */
  merge: function() {
    this.parent.variables = util.array_merge(this.parent.variables, this.variables);
    this.parent.mixins = util.array_merge(this.parent.mixins, this.mixins);
  }
});
