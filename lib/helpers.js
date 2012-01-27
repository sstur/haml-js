//String functions
function ltrim(s) {
  return String(s).replace(/^\s+/, '');
}
function rtrim(s) {
  return String(s).replace(/\s+$/, '');
}
function substr(/*...*/) {}


//Array functions
function preg_grep(regEx, source) {
  return source.filter(function(el) {
    return regEx.test(el);
  });
}

function array_merge(arr1, arr2) {
  var arr = [];
  var arrays = Array.prototype.slice.call(arguments);
  for (var i = 0; i < arrays.length; i++) {
    arr.splice.apply(arr, [arr.length, 0].concat(arrays[i]))
  }
  return arr;
}


//Path functions
function basename(path) {}
function dirname(path) {}
function realpath(path) {}


//Filesystem functions
function file_get_contents(path) {}
function file_put_contents(path, contents) {}
function file_exists(path) {}
function is_dir(path) {}
function mkdir(path) {}
function scandir(path) {}
function filemtime(path) {}

//Misc functions
function md5(str) {}
function merge(/*...*/) {}
function explode(/*...*/) {}

function serialize(obj) {
  return JSON.stringify(obj);
}

function unserialize(str) {
  return JSON.parse(str);
}




//Not Currently In Use
defineGlobal('DIRECTORY_SEPARATOR', '/');

function defineGlobal(name, value) {
  if (typeof global == 'undefined') {
    this[name] = value;
  } else {
    global[name] = value;
  }
}

function replaceAll(str, replacements) {}

function is_object(o) {
  return (o && typeof o == 'object') ? true : false;
}

function empty(o) {
  return o == null;
}



