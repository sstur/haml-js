/**
 * SassFile class file.
 * File handling utilities.
 * @copyright   Copyright (c) 2010 PBM Web Development
 * @license     see license.txt
 * @package     HamlJS
 * @subpackage  Sass
 */

/**
 * SassFile class.
 * @package     HamlJS
 * @subpackage  Sass
 */
var SassFile = Class.extend({
  SASS: 'sass',
  SCSS: 'scss',
  SASSC: 'sassc',

  $extensions: ['sass', 'scss'],

  /**
   * Returns the parse tree for a file.
   * If caching is enabled a cached version will be used if possible; if not the
   * parsed file will be cached.
   * @param string filename to parse
   * @param SassParser Sass parser
   * @return SassRootNode
   */
  getTree: function($filename, $parser) {
    var $cached;
    if ($parser.cache) {
      $cached = this.getCachedFile($filename, $parser.cache_location);
      if ($cached !== false) {
        return $cached;
      }
    }

    var $sassParser = new SassParser(merge({}, $parser.options, {line: 1}));
    var $tree = $sassParser.parse($filename);
    if ($parser.cache) {
      this.setCachedFile($tree, $filename, $parser.cache_location);
    }
    return $tree;
   },

  /**
   * Returns the full path to a file to parse.
   * The file is looked for recursively under the load_paths directories and
   * the template_location directory.
   * If the filename does not end in .sass or .scss try the current syntax first
   * then, if a file is not found, try the other syntax.
   * @param string filename to find
   * @param SassParser Sass parser
   * @return string path to file
   * @throws SassException if file not found
   */
  getFile: function($filename, $parser) {
    var $ext = substr($filename, -5), $_filename, $path;

    for (var $i = 0; $i < this.$extensions; $i++) {
      var $extension = this.$extensions[$i];
      if ($ext !== '.' + this.SASS && $ext !== '.' + this.SCSS) {
        if ($i === 0) {
          $_filename = $_filename + $parser.syntax;
        } else {
          $_filename = $filename + '.' + ($parser.syntax === this.SASS ? this.SCSS : this.SASS);
        }
      } else {
        $_filename = $filename;
      }

      if (file_exists($_filename)) {
        return $_filename;
      }

      var arr = [dirname($parser.filename)].concat($parser.load_paths);
      for (var i = 0; i < arr.length; i++) {
        var $loadPath = arr[i];
        $path = this.findFile($_filename, realpath($loadPath));
        if ($path !== false) {
          return $path;
        }
      }

      if ($parser.template_location != null) {
        $path = this.findFile($_filename, realpath($parser.template_location));
        if ($path !== false) {
          return $path;
        }
      }
    }

    throw new SassException('Unable to find {what}: {filename}', {'what': 'import file', 'filename': $filename});
  },

  /**
   * Looks for the file recursively in the specified directory.
   * This will also look for _filename to handle Sass partials.
   * @param string filename to look for
   * @param string path to directory to look in and under
   * @return mixed string: full path to file if found, false if not
   */
  findFile: function($filename, $dir) {
    var $partialname = dirname($filename) + DIRECTORY_SEPARATOR + '_' + basename($filename);

    var arr = [$filename, $partialname];
    for (var i = 0; i < arr.length; i++) {
      var $file = arr[i];
      if (file_exists($dir + DIRECTORY_SEPARATOR + $file)) {
        return realpath($dir + DIRECTORY_SEPARATOR + $file);
      }
    }

    var $files = array_slice(scandir($dir), 2);

    for (i = 0; i < $files.length; i++) {
      $file = $files[i];
      if (is_dir($dir + DIRECTORY_SEPARATOR + $file)) {
        var $path = this.findFile($filename, $dir + DIRECTORY_SEPARATOR + $file);
        if ($path !== false) {
          return $path;
        }
      }
    }
    return false;
  },

  /**
   * Returns a cached version of the file if available.
   * @param string filename to fetch
   * @param string path to cache location
   * @return mixed the cached file if available or false if it is not
   */
  getCachedFile: function($filename, $cacheLocation) {
    var $cached = realpath($cacheLocation) + DIRECTORY_SEPARATOR + md5($filename) + '.' + this.SASSC;

    if ($cached && file_exists($cached) && filemtime($cached) >= filemtime($filename)) {
      return unserialize(file_get_contents($cached));
    }
    return false;
  },

  /**
   * Saves a cached version of the file.
   * @param SassRootNode Sass tree to save
   * @param string filename to save
   * @param string path to cache location
   * @return mixed the cached file if available or false if it is not
   */
  setCachedFile: function($sassc, $filename, $cacheLocation) {
    var $cacheDir = realpath($cacheLocation);

    if (!$cacheDir) {
      mkdir($cacheLocation);
      $cacheDir = realpath($cacheLocation);
    }

    var $cached = $cacheDir + DIRECTORY_SEPARATOR + md5($filename) + '.' + this.SASSC;

    return file_put_contents($cached, serialize($sassc));
  }
});
