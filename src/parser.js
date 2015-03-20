'use strict';

var {repeat, parseTill, takeTill} = require('./utils');

var markdown = require('markdown').markdown;
var _ = require('lodash-node');
var semver = require('semver');

var UNRELEASED_RE = /^(unreleased|upcoming)$/i;

export default function parseChangelog(string) {
  var md = markdown.parse(string);
  md.shift();
  var prelude = parsePrelude(md);
  var releases = parseReleases(md);
  var epilogue = md;
  return {prelude, releases, epilogue};
}

var parsePrelude = takeTill(isReleaseHeader);

var parseReleases = repeat(parseRelease);

function parseRelease(els) {
  var el = els[0];
  if (!isReleaseHeader(el))
    return null;

  els.shift();
  var title = el[2];

  var prelude = parseContent(els);

  var release = _.extend({
    title: title,
    prelude: prelude,
  }, parseReleaseDetails(title));

  var sections = repeat(sectionParser(3))(els);
  sections.forEach(({title, content}) => {
    release[title] = extractBulletList(content);
  });

  release.epilogue = takeTill(isReleaseHeader)(els);
  return release;
}


function isReleaseHeader(el) {
  return isHeader(el) && el[1].level === 2 &&
         ( el[2].match(/^v?\d+\.\d+\.\d+/) ||
           el[2].match(UNRELEASED_RE));
}

function parseReleaseDetails(str) {
  if (str.match(UNRELEASED_RE))
    return { version: 'upcoming' };

  var versionMatch = str.match(/^v?(\d+\.\d+\.\d+)/);
  if (!versionMatch)
    return null;

  var version = semver.valid(versionMatch[1]);
  if (!version)
    return null;

  var dateMatch = str.match(/\d\d\d\d-\d\d-\d\d$/);
  var date = (dateMatch && dateMatch[0]) || null;

  return { version, date };
}

var parseContent = parseTill(isHeader);

function sectionParser(level) {
  return function(md) {
    var el = md[0];
    if (!(isHeader(el) && el[1].level === level))
      return;

    md.shift();
    var title = el[2];

    function newSection(el) {
      return isHeader(el) && el[1].level <= level;
    }

    var content = takeTill(newSection)(md);

    return {
      title: title,
      content: content
    };
  };
}

function extractBulletList(md) {
  var list = md[0];
  if (!(list && list[0] === 'bulletlist'))
    return null;

  return _.map(list.slice(1), function(item) {
    return item.slice(1)[0];
  });
}

function isHeader(el) {
  return el && el[0] === 'header';
}
