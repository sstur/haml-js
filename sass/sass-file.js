"use strict";
var util = require('../lib/util');
var Class = require('../lib/class');

var Sass = require('./sass');
var SassParser = require('./sass-parser');
var SassRootNode = require('./tree/sass-root-node');

/**
 * @class SassFile
 * File handling utilities.
 */
var SassFile = module.exports = Class.extend({
  SASS: 'sass',
  SCSS: 'scss',
  SASSC: 'sassc',

  extensions: ['sass', 'scss'],

  /**
   * Returns the parse tree for a file.
   * If caching is enabled a cached version will be used if possible; if not the
   * parsed file will be cached.
   * @param {string} filename - filename to parse
   * @param {SassParser} parser - Sass parser
   * @returns {SassRootNode}
   */
  getTree: function(filename, parser) {
    var cached;
    if (parser.cache) {
      cached = this.getCachedFile(filename, parser.cache_location);
      if (cached !== false) {
        return cached;
      }
    }

    var sassParser = new SassParser(util.merge({}, parser.options, {line: 1}));
    var tree = sassParser.parse(filename);
    if (parser.cache) {
      this.setCachedFile(tree, filename, parser.cache_location);
    }
    return tree;
   },

  /**
   * Returns the full path to a file to parse.
   * The file is looked for recursively under the load_paths directories and
   * the template_location directory.
   * If the filename does not end in .sass or .scss try the current syntax first
   * then, if a file is not found, try the other syntax.
   * Throws SassException if file not found.
   * @param {string} filename - filename to find
   * @param {SassParser} parser - Sass parser
   * @returns {string} path to file
   */
  getFile: function(filename, parser) {
    var ext = filename.slice(-5), _filename, path, i;

    for (i = 0; i < this.extensions; i++) {
      var extension = this.extensions[i];
      if (ext !== '.' + this.SASS && ext !== '.' + this.SCSS) {
        if (i === 0) {
          _filename = _filename + parser.syntax;
        } else {
          _filename = filename + '.' + (parser.syntax === this.SASS ? this.SCSS : this.SASS);
        }
      } else {
        _filename = filename;
      }

      if (util.file_exists(_filename)) {
        return _filename;
      }

      var arr = [util.dirname(parser.filename)].concat(parser.load_paths);
      for (i = 0; i < arr.length; i++) {
        var loadPath = arr[i];
        path = this.findFile(_filename, util.realpath(loadPath));
        if (path !== false) {
          return path;
        }
      }

      if (parser.template_location != null) {
        path = this.findFile(_filename, util.realpath(parser.template_location));
        if (path !== false) {
          return path;
        }
      }
    }

    throw new Sass.Exception('Unable to find {what}: {filename}', {'what': 'import file', 'filename': filename});
  },

  /**
   * Looks for the file recursively in the specified directory.
   * This will also look for _filename to handle Sass partials.
   * @param {string} filename - filename to look for
   * @param {string} dir - path to directory to look in and under
   * @returns full path to file or `false` if not found
   */
  findFile: function(filename, dir) {
    var partialname = util.dirname(filename) + '/_' + util.basename(filename);
    var file;

    var arr = [filename, partialname];
    for (var i = 0; i < arr.length; i++) {
      file = arr[i];
      if (util.file_exists(dir + '/' + file)) {
        return util.realpath(dir + '/' + file);
      }
    }

    var files = util.scandir(dir).slice(2);
    for (i = 0; i < files.length; i++) {
      file = files[i];
      if (util.is_dir(dir + '/' + file)) {
        var path = this.findFile(filename, dir + '/' + file);
        if (path !== false) {
          return path;
        }
      }
    }
    return false;
  },

  /**
   * Returns a cached version of the file if available.
   * @param {string} filename - filename to fetch
   * @param {string} cacheLocation - path to cache location
   * @returns the cached file if available or false if not
   */
  getCachedFile: function(filename, cacheLocation) {
    var cached = util.realpath(cacheLocation) + '/' + util.md5(filename) + '.' + this.SASSC;

    if (cached && util.file_exists(cached) /* TODO: && filemtime(cached) >= filemtime(filename) */ ) {
      return new SassRootNode(util.file_get_contents(cached));
    }
    return false;
  },

  /**
   * Saves a cached version of the file.
   * @param {SassRootNode} sassc - Sass tree to save
   * @param {string} filename - filename to save
   * @param {string} cacheLocation - path to cache location
   * @returns the cached file if available or false if not
   */
  setCachedFile: function(sassc, filename, cacheLocation) {
    var cacheDir = util.realpath(cacheLocation);
    var cached = cacheDir + '/' + util.md5(filename) + '.' + this.SASSC;
    return util.file_put_contents(cached, sassc.serialize());
  }
});
