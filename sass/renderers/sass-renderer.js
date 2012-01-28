"use strict";
var SassCompactRenderer = require('sass-compact-renderer');
var SassCompressedRenderer = require('sass-compressed-renderer');
var SassExpandedRenderer = require('sass-expanded-renderer');
var SassNestedRenderer = require('sass-nested-renderer');

/**
 * @class SassRenderer
 */
var SassRenderer = module.exports = Class.extend({
  /**
   * Output Styles
   */
  STYLE_COMPRESSED: 'compressed',
  STYLE_COMPACT: 'compact',
  STYLE_EXPANDED: 'expanded',
  STYLE_NESTED: 'nested',

  INDENT: '  ',

  /**
   * Returns the renderer for the required render style.
   * @param {string} style - render style
   * @returns {SassRenderer}
   */
  getRenderer: function(style) {
    switch (style) {
      case this.STYLE_COMPACT:
        return new SassCompactRenderer();
      case this.STYLE_COMPRESSED:
        return new SassCompressedRenderer();
      case this.STYLE_EXPANDED:
        return new SassExpandedRenderer();
      case this.STYLE_NESTED:
        return new SassNestedRenderer();
    }
  }
});
