defineGlobal('DIRECTORY_SEPARATOR', '/');

function defineGlobal(name, value) {
  global[name] = value;
}

function is_object(o) {
  return !!o && typeof o == 'object';
}

function empty() {
  return o == null;
}


//Array functions
function array_slice() {}


//String functions
function strtr() {}
function substr() {}


//Path functions
function basename() {}
function dirname() {}
function realpath() {}


//Filesystem functions
function file_exists() {}
function mkdir() {}
function scandir() {}
function filemtime() {}
function file_get_contents() {}
function file_put_contents() {}


//Misc functions
function md5() {}
function merge(obj1, obj2) {}

function unserialize(str) {
  return JSON.parse(str);
}
function serialize(obj) {
  return JSON.stringify(obj);
}




