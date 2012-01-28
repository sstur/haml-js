"use strict";
var util = require('../../lib/util');

var Sass = require('../sass');
var SassNode = require('./sass-node');
var SassContext = require('./sass-context');
var SassScriptFunction = require('../script/sass-script-function');

/**
 * SassMixinNode class.
 * Represents a Mixin.
 * @package     HamlJS
 * @subpackage  Sass.tree
 */
var SassMixinNode = module.exports = SassNode.extend({
  NODE_IDENTIFIER: '+',
  MATCH: /^(\+|@include\s+)([-\w]+)\s*(?:\((.*?)\))?$/i,
  IDENTIFIER: 1,
  NAME: 2,
  ARGS: 3,

  /**
   * @var string name of the mixin
   */
  name: null,
  /**
   * @var array arguments for the mixin
   */
  args: [],

  /**
   * SassMixinDefinitionNode constructor.
   * @param {object} token - source token
   * @return {SassMixinNode}
   */
  init: function(token) {
    this._super(token);
    var matches = token.source.match(this.MATCH);
    this.name = matches[this.NAME];
    if (matches && matches[this.ARGS]) {
      this.args = SassScriptFunction.extractArgs(matches[this.ARGS]);
    }
  },

  /**
   * Parse this node.
   * Set passed arguments and any optional arguments not passed to their
   * defaults, then render the children of the mixin definition.
   * @param {SassContext} the context in which this node is parsed
   * @return array the parsed node
   */
  parse: function(context) {
    var mixin = context.getMixin(this.name);

    context = new SassContext(context);
    var argc = count(this.args);
    var count = 0;
    for (var name in mixin.args) {
      var value = mixin.args[name];
      if (count < argc) {
        context.setVariable(name, this.evaluate(this.args[count++], context));
      } else
      if (value) {
        context.setVariable(name, this.evaluate(value, context));
      } else {
        throw new Sass.MixinNodeException("Mixin.{mname}: Required variable ({vname}) not given.\nMixin defined: {dfile}.{dline}\nMixin used", {'vname': name, 'mname': this.name, 'dfile': mixin.token.filename, 'dline': mixin.token.line}, this);
      }
    }

    var children = [];
    mixin.children.forEach(function(child) {
      child.parent = this;
      children = util.array_merge(children, child.parse(context));
    }, this);

    context.merge();
    return children;
  },

  /**
   * Returns a value indicating if the token represents this type of node.
   * @param object token
   * @return boolean true if the token represents this type of node, false if not
   */
  isa: function(token) {
    return (token.source.charAt(0) === this.NODE_IDENTIFIER);
  }
});
