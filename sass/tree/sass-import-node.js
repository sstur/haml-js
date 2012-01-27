var Sass = require('../sass');
var SassNode = require('./sass-node');

/**
 * @class SassImportNode
 * Represents a CSS Import.
 */
var SassImportNode = module.exports = SassNode.extend({
  IDENTIFIER: '@',
  MATCH: /^@import\s+(.+)/i,
  MATCH_CSS: /^(.+\.css|url\(.+\)|.+" \w+|"http)/im,
  FILES: 1,

  /**
   * @var array files to import
   */
  files: [],

  /**
   * SassImportNode.
   * @param {object} token - source token
   * @return {SassImportNode}
   */
  init: function(token) {
    this._super(token);
    var matches = token.source.match(this.MATCH);
    matches[this.FILES].split(',').forEach(function(file) {
      this.files.push(file.trim());
    }, this);
  },

  /**
   * Parse this node.
   * If the node is a CSS import return the CSS import rule.
   * Else returns the rendered tree for the file.
   * @param {SassContext} context - the context in which this node is parsed
   * @return {array} the parsed node
   */
  parse: function(context) {
    var imported = [];
    this.files.forEach(function(file) {
      if (file.match(this.MATCH_CSS)) {
        return "@import ${file}";
      } else {
        file = trim(file, '\'"');
        var tree = this.getTree(this.getFile(file, this.parser), this.parser);
        if (!tree) {
          throw new Sass.ImportNodeException('Unable to create document tree for {file}', {'{file}': file}, this);
        } else {
          array_merge(imported, tree.parse(context).children);
        }
      }
    }, this);
    return imported;
  }
});
