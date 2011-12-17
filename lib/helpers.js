defineGlobal('DIRECTORY_SEPARATOR', '/')

function defineGlobal(name, value) {
  global[name] = value;
}

function is_object(o) {
  return !!o && typeof o == 'object';
}

function empty() {
  return o == null;
}

function strtr() {
  //TODO
}

function dirname() {
  //TODO
}

