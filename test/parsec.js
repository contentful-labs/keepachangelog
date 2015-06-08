import {expect} from 'chai'
import * as PS from '../src/parsec';
import Parsimmon from 'parsimmon';

var P = Parsimmon;

describe('parsec', function () {

  it('parses success', function () {
    let parser = PS.co(function* () {
      let val1 = yield P.succeed('1');
      let val2 = yield P.succeed('2');
      return {val1, val2}
    })

    expect(parser.parse([]).value).to.deep.equal({val1: '1', val2: '2'})
  })

  it('parses success', function () {
    let parser = PS.co(function* () {
      yield P.fail('error');
    })

    expect(parser.parse([]).status).to.equal(false)
  })

  it('parses token', function () {
    let parser = PS.co(function* () {
      yield PS.token('mytoken');
    })

    expect(parser.parse(['mytoken']).status).to.equal(true)
  })

  it('parses many', function () {
    let parser = PS.co(function* () {
      return yield PS.token('a').or(PS.token('b'));
    }).many()

    let tokens = ['a', 'b']
    expect(parser.parse(tokens).value).to.deep.equal(['a', 'b'])
  })

  it('parses many failures', function () {
    let parser = PS.co(function* () {
      yield PS.token('a')
    }).many()

    let tokens = ['a', 'b']
    expect(parser.parse(tokens).status).to.equal(false)
  })

  it('parses with takeTill', function () {
    let parser = PS.takeTill((x) => x === 'b').skip(P.all)
    let tokens = ['a', 'a', 'b', 'c']
    expect(parser.parse(tokens).value).to.deep.equal(['a', 'a'])
  })

  it('parses with takeWhile', function () {
    let parser = PS.takeWhile((x) => x === 'a').skip(P.all)
    let tokens = ['a', 'a', 'b', 'c']
    expect(parser.parse(tokens).value).to.deep.equal(['a', 'a'])
  })
})
