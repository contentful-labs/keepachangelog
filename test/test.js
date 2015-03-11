import path from 'path'
import {readFileSync} from 'fs'
import {expect} from 'chai'
import {parse} from '../src'
import {find} from 'lodash-node'

function readFixture(name) {
  var p = path.resolve('test', 'fixtures', name) + '.md'
  return readFileSync(p, {encoding: 'utf8'})
}

describe('changelog', function() {

  it('checks fixtures', function() {
    var source = readFixture('all')
    var changelog = parse(source)
    expect(changelog.build()).to.equal(source)
  });

});
