"use strict";
var util = require('../../lib/util');

var Sass = require('../sass');
var SassNode = require('./sass-node');

/**
 * @class SassRuleNode
 * Represents a CSS rule.
 */
var SassRuleNode = module.exports = SassNode.extend({
  MATCH: /^(.+?)(?:\s*\{)?$/,
  SELECTOR: 1,
  CONTINUED: ',',

  /**
   * @const string that is replaced with the parent node selector
   */
  PARENT_REFERENCE: '&',

  /**
   * @var array selector(s)
   */
  selectors: [],

  /**
   * @var array parent selectors
   */
  parentSelectors: [],

  /**
   * @var array resolved selectors
   */
  resolvedSelectors: [],

  /**
   * @var boolean whether the node expects more selectors
   */
  isContinued: null,

  /**
   * SassRuleNode constructor.
   * @param {object} token - source token
   * @return {SassRuleNode}
   */
  init: function(token) {
    this._super(token);
    var matches = token.source.match(this.MATCH);
    this.addSelectors(matches[SassRuleNode.SELECTOR]);
  },

  /**
   * Adds selector(s) to the rule.
   * If the selectors are to continue for the rule the selector must end in a comma
   * @param {string} selectors
   */
  addSelectors: function(selectors) {
    this.isContinued = selectors.substr(-1) === this.CONTINUED;
    this.selectors = this.selectors.concat(this.explode(selectors));
  },

  /**
   * Returns a value indicating if the selectors for this rule are to be continued.
   * @return {boolean} true if the selectors for this rule are to be continued,
   * false if not
   */
  getIsContinued: function() {
    return this.isContinued;
  },

  /**
   * Parse this node and its children into static nodes.
   * @param {SassContext} context - the context in which this node is parsed
   * @return {array} the parsed node and its children
   */
  parse: function(context) {
    var node = this.clone();
    node.selectors = this.resolveSelectors(context);
    node.children = this.parseChildren(context);
    return [node];
  },

  /**
   * Render this node and its children to CSS.
   * @return {string} the rendered node
   */
  render: function() {
    this.extend();
    var rules = '';
    var properties = [];

    this.children.forEach(function(child) {
      child.parent = this;
      if (child instanceof SassRuleNode) {
        rules += child.render();
      } else {
        properties.push(child.render());
      }
    }, this);

    return this.renderer.renderRule(this, properties, rules);
  },

  /**
   * Extend this nodes selectors
   * `extendee` is the subject of the @extend directive
   * `extender` is the selector that contains the @extend directive
   * `selector` a selector or selector sequence that is to be extended
   */
  extend: function() {
    var extendee, pattern;
    for (extendee in this.root.extenders) {
      var extenders = this.root.extenders[extendee];
      if (this.isPsuedo(extendee)) {
        extendee = extendee.split(':');
        pattern = util.preg_quote(extendee[0]) + '((\\.[-\\w]+)*):' + util.preg_quote(extendee[1]);
      } else {
        pattern = util.preg_quote(extendee);
      }
      util.preg_grep(pattern + '$', this.selectors).forEach(function(selector) {
        extenders.forEach(function(extender) {
          if (Array.isArray(extendee)) {
            this.selectors.push(selector.replace(new RegExp('(.*?)' + pattern + '$', 'g'), '$1' + extender + '$2'));
          } else
          if (this.isSequence(extender) || this.isSequence(selector)) {
            this.selectors = this.selectors.concat(this.mergeSequence(extender, selector));
          } else {
            this.selectors.push(util.replace(selector, extendee, extender));
          }
        }, this);
      }, this);
    }
  },

  /**
   * Tests whether the selector is a psuedo selector
   * @param {string} selector - selector to test
   * @return {boolean} true if the selector is a psuedo selector, false if not
   */
  isPsuedo: function(selector) {
    return selector.indexOf(':') >= 0;
  },

  /**
   * Tests whether the selector is a sequence selector
   * @param {string} selector - selector to test
   * @return {boolean} true if the selector is a sequence selector, false if not
   */
  isSequence: function(selector) {
    return selector.indexOf(' ') >= 0;
  },

  /**
   * Merges selector sequences
   * @param {string} extender - the extender selector
   * @param {string} selector - selector to extend
   * @return {array} the merged sequences
   */
  mergeSequence: function(extender, selector) {
    extender = extender.split(' ');
    var end = ' ' + extender.pop();
    selector = selector.split(' ');
    selector.pop();

    var common = [];
    while(extender[0] === selector[0]) {
      common.push(selector.shift());
      extender.shift();
    }

    var begining = (common) ? common.join(' ') + ' ' : '';

    return [
      begining.join(' ', selector) + ' ' + extender.join(' ') + end,
      begining.join(' ', extender) + ' ' + selector.join(' ') + end
    ];
  },

  /**
   * Returns the selectors
   * @return {array} selectors
   */
  getSelectors: function() {
    return this.selectors;
  },

  /**
   * Resolves selectors.
   * Interpolates SassScript in selectors and resolves any parent references or
   * appends the parent selectors.
   * @param {SassContext} context - the context in which this node is parsed
   */
  resolveSelectors: function(context) {
    var resolvedSelectors = [];
    this.parentSelectors = this.getParentSelectors(context);

    for (var key in this.selectors) {
      var selector = this.selectors[key];
      selector = this.interpolate(selector, context);
      //selector = this.evaluate(this.interpolate(selector, context), context).toString();
      if (this.hasParentReference(selector)) {
        resolvedSelectors = util.array_merge(resolvedSelectors, this.resolveParentReferences(selector, context));
      } else
      if (this.parentSelectors) {
        this.parentSelectors.forEach(function(parentSelector) {
          resolvedSelectors.push(parentSelector + ' ' + selector);
        }, this);
      } else {
        resolvedSelectors.push(selector);
      }
    }
    resolvedSelectors.sort();
    return resolvedSelectors;
  },

  /**
   * Returns the parent selector(s) for this node.
   * This in an empty array if there is no parent selector.
   * @return {array} the parent selector for this node
   */
  getParentSelectors: function(context) {
    var $ancestor = this.parent;
    while (!$ancestor instanceof SassRuleNode && $ancestor.hasParent()) {
      $ancestor = $ancestor.parent;
    }

    if ($ancestor instanceof SassRuleNode) {
      return $ancestor.resolveSelectors(context);
    }
    return [];
  },

  /**
   * Returns the position of the first parent reference in the selector.
   * If there is no parent reference in the selector this function returns
   * boolean FALSE.
   * Note that the return value may be non-Boolean that evaluates to FALSE,
   * i.e. 0. The return value should be tested using the === operator.
   * @param {string} selector - selector to test
   * @return {mixed} integer: position of the the first parent reference,
   * boolean: false if there is no parent reference.
   */
  parentReferencePos: function(selector) {
    var inString = '';
    for (var i = 0, l = selector.length; i < l; i++) {
      var c = selector.charAt(i);
      if (c === this.PARENT_REFERENCE && !inString) {
        return i;
      } else
      if (!inString && (c === '"' || c === "'")) {
        inString = c;
      } else
      if (c === inString) {
        inString = '';
      }
    }
    return false;
  },

  /**
   * Determines if there is a parent reference in the selector
   * @param {string} selector
   * @return {boolean} true if there is a parent reference in the selector
   */
  hasParentReference: function(selector) {
    return this.parentReferencePos(selector) !== false;
  },

  /**
   * Resolves parent references in the selector
   * @param {string} selector - selector
   * @return {string} selector with parent references resolved
   */
  resolveParentReferences: function(selector, context) {
    var resolvedReferences = [];
    if (!this.parentSelectors.length) {
      throw new Sass.RuleNodeException('Can not use parent selector (' + this.PARENT_REFERENCE + ') when no parent selectors', {}, this);
    }
    this.getParentSelectors(context).forEach(function($parentSelector) {
      resolvedReferences.push(util.replace(selector, this.PARENT_REFERENCE, $parentSelector));
    }, this);
    return resolvedReferences;
  },

  /**
   * Explodes a string of selectors into an array.
   * We can't use PHP explode as this will potentially explode attribute
   * matches in the selector, e.g. div[title="some,value"] and interpolations.
   * @param {string} string - selectors
   * @return {array} selectors
   */
  explode: function(string) {
    var selectors = [];
    var inString = false;
    var interpolate = false;
    var selector = '';

    for (var i = 0, l = string.length; i < l; i++) {
      var c = string.charAt(i);
      if (c === this.CONTINUED && !inString && !interpolate) {
        selectors.push(selector.trim());
        selector = '';
      } else {
        selector += c;
        if (c === '"' || c === "'") {
          do {
            var _c = string.charAt(++i);
            selector += _c;
          } while (_c !== c);
        } else
        if (c === '#' && string.charAt(i + 1) === '{') {
          do {
            c = string.charAt(++i);
            selector += c;
          } while (c !== '}');
        }
      }
    }

    if (selector) {
      selectors.push(selector.trim());
    }

    return selectors;
  }
});
