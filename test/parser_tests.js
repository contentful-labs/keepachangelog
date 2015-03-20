import path           from 'path'
import {readFileSync} from 'fs'
import {expect}       from 'chai'
import {parse}        from '../src'
import {find}         from 'lodash-node'

function readFixture(name) {
  var p = path.resolve('test', 'fixtures', name) + '.md'
  return readFileSync(p, {encoding: 'utf8'})
}

describe('Parser', function () {
  beforeEach(function () {
    var source = readFixture('all');
    this.parsed = parse(source);
  });

  describe('returned object', function () {
    //describe('prelude property', function () {
    //});

    describe('releases property', function () {
      describe('upcoming version', function () {
        beforeEach(function () {
          this.upcoming = find(this.parsed.releases, {version: 'upcoming'} );
        });

        it('has a changed property will all the additions', function () {
          var expectedAdded = ['one added'];

          expect(this.upcoming.Added).to.deep.equal(expectedAdded);
        });

        it('has an added property with all the changes', function () {
          var expectedChanged =  [
            'this has changed',
            'this item continues\nin the next line'
          ];

          expect(this.upcoming.Changed).to.deep.equal(expectedChanged);
        });

        it('has an added property with all the changes', function () {
          var expectedRemoved =  ['gone :('];

          expect(this.upcoming.Removed).to.deep.equal(expectedRemoved);
        });
      });
    });

    //describe('epilogue property', function () {
    //});
  });
});
