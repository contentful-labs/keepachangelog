import Parsimmon from 'parsimmon';
var P = Parsimmon;

export function co (gen) {
  return P.succeed().chain(function () {
    let it = gen();
    return next();

    function next (x) {
      let {done, value} = it.next(x);
      if (done)
        return P.succeed(value);
      else
        return wrapParser(value).chain(next);
    }
  });
}


export function when (predicate) {
  return P.custom(function (success, failure) {
    return function (stream, i) {
      if (stream.length <= i)
        return failure(i, 'unexpected eof')
      let token = stream[i];
      if (predicate(token))
        return success(i+1, token)
      else
        return failure(i, predicate)
    }
  })
}


export function token (expected) {
  return when((token) => token === expected)
}


export function any () {
  return when(() => true)
}


export function tryParse (parser) {
  return P.custom(function (success) {
    return function (stream, i) {
      let result = parser.parse(stream.slice(i))
      if (result.status)
        return result
      else
        return success(i, null)
    }
  });
}


export function takeTill (predicate) {
  return takeWhile(x => !predicate(x));
}

export function takeWhile (predicate) {
  return co(function* () {
    return yield when(predicate);
  }).many();
}



var Parser = P.succeed().constructor;
function wrapParser (value) {
  if (value instanceof Parser)
    return value
  else
    return P.succeed(value)
}
