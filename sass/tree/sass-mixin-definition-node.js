var Sass = require('../sass');
var SassNode = require('./sass-node');

/**
 * SassMixinDefinitionNode class.
 * Represents a Mixin definition.
 * @package     HamlJS
 * @subpackage  Sass.tree
 */
var SassMixinDefinitionNode = module.exports = SassNode.extend({
  NODE_IDENTIFIER: '=',
  MATCH: /^(=|@mixin\s+)([-\w]+)\s*(?:\((.+?)\))?\s*$/i,
  IDENTIFIER: 1,
  NAME: 2,
  ARGUMENTS: 3,

  /**
   * @var string name of the mixin
   */
  name: null,
  /**
   * @var array arguments for the mixin as name=>value pairs were value is the
   * default value or null for required arguments
   */
  args: [],

  /**
   * SassMixinDefinitionNode constructor.
   * @param {object} token - source token
   * @return {SassMixinDefinitionNode}
   */
  init: function(token) {
    if (token.level !== 0) {
      throw new Sass.MixinDefinitionNodeException('Mixins can only be defined at root level', [], this);
     }
    this._super(token);
    var matches = token.source.match(this.MATCH);
    if (!matches) {
      throw new Sass.MixinDefinitionNodeException('Invalid {what}', {'{what}': 'Mixin'}, this);
    }
    this.name = matches[this.NAME];
    if (matches[this.ARGUMENTS]) {
      matches[this.ARGUMENTS].split(',').forEach(function(arg) {
        var sep = (matches[this.IDENTIFIER] === this.NODE_IDENTIFIER) ? '=' : ':';
        arg = arg.trim().split(sep);
        this.args[arg[0].trim().substr(1)] = (arg.length == 2 ? arg[1].trim() : null);
      }, this);
    }
  },

  /**
   * Parse this node.
   * Add this mixin to  the current context.
   * @param {SassContext} context - the context in which this node is parsed
   * @return {array} the parsed node - an empty array
   */
  parse: function(context) {
    context.addMixin(this.name, this);
    return [];
  },

  /**
   * Returns the arguments with default values for this mixin
   * @return {array} the arguments with default values for this mixin
   */
  getArgs: function() {
    return this.args;
  },

  /**
   * Returns a value indicating if the token represents this type of node.
   * @param {object} token
   * @return {boolean} true if the token represents this type of node, false if not
   */
  isa: function(token) {
    return token.source.charAt(0) === this.NODE_IDENTIFIER;
  }
});
