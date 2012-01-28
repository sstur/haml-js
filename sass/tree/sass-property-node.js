"use strict";
var util = require('../../lib/util');

var Sass = require('../sass');
var SassNode = require('./sass-node');
var SassScriptParser = require('../script/sass-script-parser');

/**
 * @class SassPropertyNode
 * Represents a CSS property.
 */
var SassPropertyNode = SassNode.extend({
  MATCH_PROPERTY_NEW: /^([^\s=:"]+)\s*(?:(= )|:)(.*?)$/,
  MATCH_PROPERTY_OLD: /^:([^\s=:]+)(?:\s*(=)\s*|\s+|$)(.*)/,
  MATCH_PSUEDO_SELECTOR: /^:?\w[-\w]+\(?/i,
  MATCH_INTERPOLATION: /^#\{(.*?)\}/i,
  NAME: 1,
  SCRIPT: 2,
  VALUE: 3,
  IS_SCRIPT: '= ',

  psuedoSelectors: [
    'root',
    'nth-child(',
    'nth-last-child(',
    'nth-of-type(',
    'nth-last-of-type(',
    'first-child',
    'last-child',
    'first-of-type',
    'last-of-type',
    'only-child',
    'only-of-type',
    'empty',
    'link',
    'visited',
    'active',
    'hover',
    'focus',
    'target',
    'lang(',
    'enabled',
    'disabled',
    'checked',
    ':first-line',
    ':first-letter',
    ':before',
    ':after',
    // CSS 2.1
    'first-line',
    'first-letter',
    'before',
    'after'
  ],

  /**
   * @var string property name
   */
  name: null,
  /**
   * @var string property value or expression to evaluate
   */
  value: null,

  /**
   * SassPropertyNode constructor.
   * @param {object} token - source token
   * @param {string} syntax - property syntax
   * @return {SassPropertyNode}
   */
  init: function(token, syntax) {
    if (!syntax) syntax = 'new';
    this._super(token);
    var matches = this.match(token, syntax);
    this.name = matches[this.NAME];
    this.value = matches[this.VALUE];
    if (matches[this.SCRIPT] === this.IS_SCRIPT) {
      this.addWarning('Setting CSS properties with "=" is deprecated; use "{name}: {value};"', {'name': this.name, 'value': this.value});
    }
  },

  /**
   * Parse this node.
   * If the node is a property namespace return all parsed child nodes. If not
   * return the parsed version of this node.
   * @param {SassContext} context - the context in which this node is parsed
   * @return {array} the parsed node
   */
  parse: function(context) {
    var ret = [];
    if (this.value) {
      var node = this.clone();
      node.name = (this.inNamespace() ? "{this.namespace}-" : '') + this.interpolate(this.name, context);
      node.value = this.evaluate(this.interpolate(this.value, context), context, SassScriptParser.CSS_PROPERTY).toString();
      if (this.vendor_properties.hasOwnProperty(node.name)) {
        this.vendor_properties[node.name].forEach(function(vendorProperty) {
          var _node = node.clone();
          _node.name = vendorProperty;
          ret.push(_node);
        }, this);
      }
      ret.push(node);
    }
    if (this.children) {
      ret = util.array_merge(ret, this.parseChildren(context));
    }
    return ret;
  },

  /**
   * Render this node.
   * @return {string} the rendered node
   */
  render: function() {
    return this.renderer.renderProperty(this);
  },

  /**
   * Returns a value indicating if this node is in a namespace
   * @return {boolean} true if this node is in a property namespace, false if not
   */
  inNamespace: function() {
    var parent = this.parent;
    do {
      if (parent instanceof SassPropertyNode) {
        return true;
      }
      parent = parent.parent;
    } while (parent);
    return false;
  },

  /**
   * Returns the namespace for this node
   * @return {string} the namespace for this node
   */
  getNamespace: function() {
    var namespace = [];
    var parent = this.parent;
    do {
      if (parent instanceof SassPropertyNode) {
        namespace.push(parent.name);
      }
      parent = parent.parent;
    } while (parent);
    return namespace.reverse().join('-');
  },

  /**
   * Returns the name of this property.
   * If the property is in a namespace the namespace is prepended
   * @return {string} the name of this property
   */
  getName: function() {
    return this.name;
  },

  /**
   * Returns the parsed value of this property.
   * @return {string} the parsed value of this property
   */
  getValue: function() {
    return this.value;
  },

  /**
   * Returns a value indicating if the token represents this type of node.
   * @param {object} syntax - token
   * @param {string} token - the property syntax being used
   * @return {boolean} true if the token represents this type of node, false if not
   */
  isa: function(token, syntax) {
    var matches = this.match(token, syntax);

    if (matches) {
      if (matches && matches[this.VALUE] && this.isPseudoSelector(matches[this.VALUE])) {
        return false;
      }
      if (token.level === 0) {
        throw new Sass.PropertyNodeException('Properties can not be assigned at root level', {}, this);
      } else {
        return true;
      }
    } else {
      return false;
    }
  },

  /**
   * Returns the matches for this type of node.
   * @param {array} token - the line to match
   * @param {string} syntax - the property syntax being used
   * @return {array} matches
   */
  match: function(token, syntax) {
    var matches;
    switch (syntax) {
      case 'new':
        matches = token.source.match(this.MATCH_PROPERTY_NEW);
        break;
      case 'old':
        matches = token.source.match(this.MATCH_PROPERTY_OLD);
        break;
      default:
        matches = token.source.match(this.MATCH_PROPERTY_NEW) || token.source.match(this.MATCH_PROPERTY_OLD);
        break;
    }
    return matches;
  },

  /**
   * Returns a value indicating if the string starts with a pseudo selector.
   * This is used to reject pseudo selectors as property values as, for example,
   * "a:hover" and "text-decoration:underline" look the same to the property
   * match regex.
   * It will also match interpolation to allow for constructs such as
   * content:#{$pos}
   * @see isa()
   * @param {string} string - the string to test
   * @return {bool} true if the string starts with a pseudo selector, false if not
   */
  isPseudoSelector: function(string) {
    var matches = string.match(this.MATCH_PSUEDO_SELECTOR);
    return (matches && matches[0] && this.psuedoSelectors.hasOwnProperty(matches[0])) || string.match(this.MATCH_INTERPOLATION);
  }
});
