var Sass = require('../sass');

/**
 * @class SassVariableNode
 * Represents a variable.
 * @package     HamlJS
 * @subpackage  Sass.tree
 */
var SassVariableNode = module.exports = SassNode.extend({
  MATCH: /^([!$])([\w-]+)\s*:?\s*((\|\|)?=)?\s*(.+?)\s*(!default)?;?$/i,
  IDENTIFIER: 1,
  NAME: 2,
  SASS_ASSIGNMENT: 3,
  SASS_DEFAULT:4,
  VALUE: 5,
  SCSS_DEFAULT: 6,
  SASS_IDENTIFIER: '!',
  SCSS_IDENTIFIER: '$',

  /**
   * @var string name of the variable
   */
  name: null,
  /**
   * @var string value of the variable or expression to evaluate
   */
  value: null,
  /**
   * @var boolean whether the variable is optionally assigned
   */
  isDefault: null,

  /**
   * SassVariableNode constructor.
   * @param {object} token - source token
   * @return {SassVariableNode}
   */
  init: function(token) {
    this._super(token);
    var matches = token.source.match(this.MATCH);
    if (!matches[this.NAME] || (matches[this.VALUE] === '')) {
      throw new Sass.VariableNodeException('Invalid variable definition; name and expression required', {}, this);
    }
    this.name = matches[this.NAME];
    this.value = matches[this.VALUE];
    this.isDefault = (!!matches[this.SASS_DEFAULT] || !!matches[this.SCSS_DEFAULT]);

    // Warn about deprecated features
    if (matches[this.IDENTIFIER] === this.SASS_IDENTIFIER) {
      this.addWarning('Variables prefixed with "!" is deprecated; use "${name}"', {'{name}': this.name});
    }
    if (matches[SassVariableNode::SASS_ASSIGNMENT]) {
      this.addWarning('Setting variables with "{sassDefault}=" is deprecated; use "${name}: {value}{scssDefault}"', {'{sassDefault}': (matches[SassVariableNode::SASS_DEFAULT]) ? '||' : '', '{name}': this.name, '{value}': this.value, '{scssDefault}': (matches[SassVariableNode::SASS_DEFAULT]) ? ' !default' : ''});
    }
  },

  /**
   * Parse this node.
   * Sets the variable in the current context.
   * @param {SassContext} context - the context in which this node is parsed
   * @return {array} the parsed node - an empty array
   */
  parse: function(context) {
    if (!this.isDefault || !context.hasVariable(this.name)) {
        context.setVariable(this.name, this.evaluate(this.value, context));
    }
    this.parseChildren(context); // Parse any warnings
    return [];
  },

  /**
   * Returns a value indicating if the token represents this type of node.
   * @param {object} token
   * @return {boolean} true if the token represents this type of node, false if not
   */
  isa: function(token) {
    return token.source[0] === this.SASS_IDENTIFIER || token.source[0] === this.SCSS_IDENTIFIER;
  }
});
