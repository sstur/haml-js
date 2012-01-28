"use strict";
var crypto = require('crypto');

var REG_LSPACE = /^\s+/;
var REG_RSPACE = /\s+$/;
var REG_REGEXP = /([.?*+^$[\]\\(){}-])/g;

//TODO: abs, ceil, floor, round

exports.ltrim = function ltrim(s) {
  return String(s).replace(REG_LSPACE, '');
};
exports.rtrim = function rtrim(s) {
  return String(s).replace(REG_RSPACE, '');
};
exports.trim = function trim(s, chars) {
  chars = chars || '\r\n';
  chars = chars.replace(REG_REGEXP, '\\$1');
  var regEx = new RegExp('^[' + chars + ']+|[' + chars + ']+$', 'ig');
  return String(s).replace(regEx, '');
};
exports.replace = function replace(str, search, repl) {
  if (typeof search == 'string') {
    search = search.replace(REG_REGEXP, '\\$1');
    search = new RegExp(search, 'ig');
  }
  return str.replace(search, repl);
};
exports.strtr = function replace(str, replacements) {
  replacements = replacements || {};
  for (var n in replacements) {
    str = exports.replace(str, n, replacements[n]);
  }
  return str;
};

exports.toHex = function toHex(num, digits) {
  digits = digits || 0;
  var ret = Number(num).toString(16);
  return (ret.length < digits) ? new Array(digits - ret.length + 1).join('0') + ret : ret;
};

exports.invert = function invert(obj) {
  obj = obj || {};
  var ret = {};
  for (var n in obj) {
    ret[obj[n]] = n;
  }
  return ret;
};


exports.match_all = function match_all(regEx, source) {
  regEx.global = true;
  var arr = [];
  source.replace(regEx, function() {
    arr.push(Array.prototype.slice.call(arguments, 0, -2));
  });
  return arr;
};

exports.preg_quote = function preg_quote(str) {
  return String(str).replace(REG_REGEXP, '\\$1');
};

exports.preg_grep = function preg_grep(regEx, source) {
  return source.filter(function(el) {
    return regEx.test(el);
  });
};

exports.array_merge = function array_merge(arr1, arr2) {
  var arr = [];
  var arrays = Array.prototype.slice.call(arguments);
  for (var i = 0; i < arrays.length; i++) {
    arr.splice.apply(arr, [arr.length, 0].concat(arrays[i]))
  }
  return arr;
};


//Misc functions
exports.md5 = function md5(str) {
  var hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};

exports.merge = function merge(source, obj) {
  source = source || {};
  var objects = Array.prototype.slice.call(arguments, 1);
  for (var i = 0; i < objects.length; i++) {
    obj = objects[i];
    for (var n in obj) {
      if (obj.hasOwnProperty(n)) source[n] = obj[n];
    }
  }
  return source;
};

//Path functions
exports.basename = function basename(path) {
  throw new Error('Not Implemented: basename');
};
exports.dirname = function dirname(path) {
  throw new Error('Not Implemented: dirname');
};
exports.realpath = function realpath(path) {
  throw new Error('Not Implemented: realpath');
};


//Filesystem functions
exports.file_get_contents = function file_get_contents(path) {
  throw new Error('Not Implemented: file_get_contents');
};
exports.file_put_contents = function file_put_contents(path, contents) {
  throw new Error('Not Implemented: file_put_contents');
};
exports.file_exists = function file_exists(path) {
  throw new Error('Not Implemented: file_exists');
};
exports.is_file = function is_file(path) {
  throw new Error('Not Implemented: is_file');
};
exports.is_dir = function is_dir(path) {
  throw new Error('Not Implemented: is_dir');
};
exports.scandir = function scandir(path) {
  throw new Error('Not Implemented: scandir');
};




//Not Currently In Use
//defineGlobal('DIRECTORY_SEPARATOR', '/');
//
//function defineGlobal(name, value) {
//  if (typeof global == 'undefined') {
//    this[name] = value;
//  } else {
//    global[name] = value;
//  }
//}
