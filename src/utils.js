'use strict';

export function repeat(fn) {
  return function(stream) {
    var values = [];
    var value;
    while (value = fn(stream)) {
      values.push(value);
    }
    return values;
  };
}

export function takeTill(predicate) {
  return function(stream) {
    var taken = [];
    while (stream[0] && !predicate(stream[0])) {
      taken.push(stream.shift());
    }
    return taken;
  };
}

export function parseTill(predicate) {
  return function(stream) {
    var els;
    var el;
    while (true) {
      el = stream[0];
      if (el && predicate(el))
        break;

      els.push(el);
      stream.shift();
    }
  };
}
