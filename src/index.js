'use strict';

var fs = require('fs');
var {find} = require('lodash-node');
var {promisify} = require('bluebird');
var readFile = promisify(fs.readFile);
var writeFile = promisify(fs.writeFile);

import parseChangelog from './parser';
import buildChangelog from './builder'

export function init (path) {
  path = path || 'CHANGELOG.md';

  return parse(
    [
      '# Change Log',
      'All notable changes to this project will be documented in this file.',
      ''
    ].join('\n')
  ).write(path);
}

export function parse(content) {
  return new Changelog(parseChangelog(content));
}

export function read(path) {
  path = path || 'CHANGELOG.md';
  return readFile(path, {encoding: 'utf8'})
  .then((content) => {
    return new Changelog(parseChangelog(content));
  });
}

function Changelog({prelude, epilogue, releases, references}) {
  this.prelude = prelude;
  this.epilogue = epilogue;
  this.releases = releases;
  this.references = references
}

Changelog.prototype.write = function(path) {
  path = path || 'CHANGELOG.md';
  return writeFile(path, this.build());
};


Changelog.prototype.build = function() {
  return buildChangelog(this);
};

Changelog.prototype.getRelease = function(version) {
  return find(this.releases, (r) => r.version === version);
};


Changelog.prototype.addUpcomingChange = function(desc) {
  this.addUpcoming('Changed', desc);
};

Changelog.prototype.addUpcoming = function(type, desc) {
  var upcoming = this.getRelease('upcoming');
  if (!upcoming) {
    upcoming = { version: 'upcoming' };
    this.releases.unshift(upcoming);
  }

  var changes = upcoming[type];
  if (!changes) {
    upcoming[type] = changes = [];
  }

  changes.push([desc]);
};

Changelog.prototype.addRelease = function(version) {
  var release = this.getRelease('upcoming');
  if (!release) { return; }

  this.releases.shift();

  var upcomingTitle = release.title;

  release.version = version;
  release.date = getDateString();
  release.title = [ ['link_ref', { ref: release.version, original: `[${release.version}]` }, release.version], ` - ${release.date}` ];

  this.releases.unshift(release);
  this.releases.unshift({ version: 'upcoming', title: upcomingTitle });

  function getDateString() {
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0')
    var mm = String(today.getMonth() + 1).padStart(2, '0')
    var yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`
  }
};
