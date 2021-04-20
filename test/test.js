'use strict';

import path from 'path'
import os from 'os'
import {readFileSync, writeFileSync, unlinkSync} from 'fs'
import {expect} from 'chai'
import sinon from 'sinon'
import {init, parse} from '../src'

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

  describe('addRelease', function () {
    var now = new Date('19 April 2021 00:00:00');
    var clock

    beforeEach(function () {
      clock = sinon.useFakeTimers(now.getTime());
    });

    afterEach(function () {
      clock.restore();
    });

    it('creates a new release', function() {
      var source = readFixture('keepachangelog')
      var changelog = parse(source)
      var released = readFixture('released')
      changelog.addRelease('0.0.9')
      expect(changelog.build()).to.equal(released)
    });
  });


  describe('init', function () {
    var cwd = process.cwd();

    function inits(path) {
      it('inits an empty CHANGELOG file with a prelude', function () {
        var prelude = [
          '# Change Log',
          'All notable changes to this project will be documented in this file.',
          ''
        ].join('\n');

        var readPath = path || './CHANGELOG.md';

        return init(path).then(function () {
          var changelog = readFileSync(readPath).toString();
          expect(changelog).to.equal(prelude);
        });
      });
    }

    describe('when no path is given', function () {
      beforeEach(function () {
        process.chdir(os.tmpdir());
      });

      afterEach(function () {
        unlinkSync('./CHANGELOG.md');
        process.chdir(cwd);
      });

      inits();
    });

    describe('when a path is given', function () {
      var path = `/tmp/CHANGELOG-${+new Date()}.md`;

      afterEach(function () {
        unlinkSync(path);
      });

      inits(path);
    })
  });
});
