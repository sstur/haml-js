"use strict";
var util = require('../../lib/util');

var Sass = require('../sass');
var SassNode = require('./sass-node');
var SassContext = require('./sass-context');
var SassRenderer = require('../renderers/sass-renderer');
var SassScriptParser = require('../script/sass-script-parser');

/**
 * SassRootNode class.
 * Also the root node of a document.
 * @package     HamlJS
 * @subpackage  Sass.tree
 */
var SassRootNode = module.exports = SassNode.extend({
  /**
   * @var SassScriptParser SassScript parser
   */
  script: null,
  /**
   * @var SassRenderer the renderer for this node
   */
  renderer: null,
  /**
   * @var SassParser
   */
  parser: null,
  /**
   * @var array extenders for this tree in the form extendee=>extender
   */
  extenders: {},

  /**
   * Root SassNode constructor.
   * @param {SassParser} parser - Sass parser
   * @returns {SassNode}
   */
  init: function(parser) {
    if (typeof parser == 'string') {
      throw new Error('SASS Node de-serializer not implemented.');
    }
    this._super({
      'source': '',
      'level': -1,
      'filename': parser.filename,
      'line': 0
    });
    this.parser = parser;
    this.script = new SassScriptParser();
    this.renderer = SassRenderer.getRenderer(parser.style);
    this.root = this;
  },

  /**
   * Parses this node and its children into the render tree.
   * Dynamic nodes are evaluated, files imported, etc.
   * Only static nodes for rendering are in the resulting tree.
   * @param {SassContext} context - the context in which this node is parsed
   * @returns {SassNode} root node of the render tree
   */
  parse: function(context) {
    var $node = this.clone();
    $node.children = this.parseChildren(context);
    return $node;
  },

  /**
   * Render this node.
   * @returns {string} the rendered node
   */
  render: function() {
    var node = this.parse(new SassContext());
    var output = '';
    node.children.forEach(function(child) {
      output += child.render();
    }, this);
    return output;
  },

  extend: function(extendee, selectors) {
    this.extenders[extendee] = (this.extenders[extendee]) ? util.array_merge(this.extenders[extendee], selectors) : selectors;
  },

  getExtenders: function() {
    return this.extenders;
  },

  /**
   * Returns a value indicating if the line represents this type of node.
   * Child classes must override this method.
   * @throws {SassNodeException} if not overriden
   */
  isa: function(line) {
    throw new Sass.NodeException('Child classes must override this method');
  }
});
