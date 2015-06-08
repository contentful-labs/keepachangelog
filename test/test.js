import path from 'path'
import {readFileSync} from 'fs'
import {expect} from 'chai'
import {parse} from '../src'

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

  it('checks keepachangelog fixture', function() {
    var source = readFixture('keepachangelog')
    var changelog = parse(source)
    expect(changelog.build()).to.equal(source)
  });

});
