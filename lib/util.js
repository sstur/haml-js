//TODO: scandir, is_file, load_file (deprecate)

//TODO: ucfirst, abs, ceil, floor, round

var REG_LSPACE = /^\s+/;
var REG_RSPACE = /\s+$/;
var REG_REGEXP = /([.?*+^$[\]\\(){}-])/g;

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
exports.md5 = function md5(str) {};
exports.merge = function merge(/*...*/) {};

//Path functions
exports.basename = function basename(path) {};
exports.dirname = function dirname(path) {};
exports.realpath = function realpath(path) {};


//Filesystem functions
exports.file_get_contents = function file_get_contents(path) {};
exports.file_put_contents = function file_put_contents(path, contents) {};
exports.file_exists = function file_exists(path) {};
exports.is_dir = function is_dir(path) {};
exports.scandir = function scandir(path) {};




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