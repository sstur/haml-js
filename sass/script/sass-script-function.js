"use strict";
var util = require('../../lib/util');
var Class = require('../../lib/class');

var SassString = require('./literals/sass-string');
var SassScriptParser = require('./sass-script-parser');

/**
 * @class SassScriptFunction
 * Preforms a SassScript function.
 */
var SassScriptFunction = Class.extend({
  /**@#+
   * Regexes for matching and extracting functions and arguments
   */
  MATCH: /^(((-\w)|(\w))[\-\w]*)\(/,
  MATCH_FUNC: /^((?:(?:-\w)|(?:\w))[\-\w]*)\((.*)\)/,
  SPLIT_ARGS: /\s*((?:['"].*?["'])|(?:.+?(?:\(.*\).*?)?))\s*(?:,|$)/,
  NAME: 1,
  ARGS: 2,

  name: null,
  args: null,

  /**
   * SassScriptFunction constructor
   * @param {string} name - name of the function
   * @param {array} args - arguments for the function
   * @return {SassScriptFunction}
   */
  init: function(name, args) {
    this.name = name;
    this.args = args;
  },

  /**
   * Evaluates the function.
   * Look for a user defined function first - this allows users to override
   * pre-defined functions, then try the pre-defined functions.
   * @return {Function} the value of this Function
   * @throws {ScriptFunctionException} if function is undefined
   */
  perform: function() {
    var name = util.replace(this.name, '-', '_');
    SassScriptParser.context.node.parser.function_paths.forEach(function(path) {
      var _path = path.split('/');
      util.scandir(path).slice(2).forEach(function(file) {
        var filename = path + '/' + file;
        if (util.is_file(filename)) {
          //TODO: fix
          //util.load_file(filename);
          //var cls = 'SassExtentions' + util.ucfirst(_path[_path.length - 2]) + 'Functions' + ucfirst(file.slice(0, -4));
          //if (method_exists(cls, name)) {
          //  return call_user_func_array(array(cls, name), this.args);
          //}
        }
      }, this);
    }, this);

    //TODO: fix
    //require('SassScriptFunctions');
    //if (method_exists('SassScriptFunctions', name)) {
    //  return call_user_func_array(array('SassScriptFunctions', name), this.args);
    //}

    // CSS function: create a SassString that will emit the function into the CSS
    var $args = [];
    this.args.forEach(function(arg) {
      $args.push(arg.toString());
    }, this);
    return new SassString(this.name + '(' + $args.join(', ') + ')');
  },

  /**
   * Imports files in the specified directory.
   * @param {string} dir - path to directory to import
   * @return {array} filenames imported
   */
  'import': function(dir) {
    var files = [];
    util.scandir(dir).slice(2).forEach(function(file) {
      if (util.is_file(dir + '/' + file)) {
        files.push(file);
        //require(dir + DIRECTORY_SEPARATOR + file);
      }
    }, this);
    return files;
  },

  /**
   * Returns a value indicating if a token of this type can be matched at
   * the start of the subject string.
   * @param {string} subject - the subject string
   * @return {string|boolean} match at the start of the string or false if no match
   */
  isa: function(subject) {
    var matches = subject.match(this.MATCH);
    if (!matches)
      return false;

    var match = matches[0];
    var paren = 1;
    var strpos = match.length;
    var strlen = subject.length;

    while(paren && strpos < strlen) {
      var c = subject[strpos++];

      match += c;
      if (c === '(') {
        paren += 1;
      } else
      if (c === ')') {
        paren -= 1;
      }
    }
    return match;
  },

  extractArgs: function(string) {
    var args = [];
    var arg = '';
    var paren = 0;
    var strpos = 0;
    var strlen = string.length;

    var c, _c;
    while (strpos < strlen) {
      c = string[strpos++];

      switch (c) {
        case '(':
          paren += 1;
          arg += c;
          break;
        case ')':
          paren -= 1;
          arg += c;
          break;
        case '"':
        case "'":
          arg += c;
          do {
            _c = string[strpos++];
            arg += _c;
          } while (_c !== c);
          break;
        case ',':
          if (paren) {
            arg += c;
            break;
          }
          args.push(arg.trim());
          arg = '';
          break;
        default:
          arg += c;
          break;
      }
    }

    if (arg) args.push(arg.trim());
    return args;
  }
});
