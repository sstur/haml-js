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
function substr(/* ... */) {}
//function replaceAll(str, replacements) {}


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
function merge(/* ... */) {}
function explode(/* ... */) {}


//To be deprecated
function ltrim(s) {
  return String(s).replace(/^\s+/, '');
}




function unserialize(str) {
  return JSON.parse(str);
}
function serialize(obj) {
  return JSON.stringify(obj);
}




