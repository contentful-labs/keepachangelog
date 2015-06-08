'use strict';

import {markdown} from 'markdown';
import {forEach, extend, map} from 'lodash-node'
import semver from 'semver';

import {elementText} from './builder'

import Parsimmon from 'parsimmon'
import * as PS from './parsec'

var P = Parsimmon

var UNRELEASED_RE = /^(unreleased|upcoming)$/i;

export default function parseChangelog(string) {
  var md = markdown.parse(string);
  md.shift();

  let parser = PS.co(function* () {
    let {references} = yield optReferences;
    let prelude = yield parsePrelude;
    let releases = yield parseRelease.many();
    let epilogue = yield P.all;
    return {prelude, releases, epilogue, references};
  })

  let res = parser.parse(md);
  if (res.status === true)
    return res.value
  else
    throw new Error('Could not parse changelog')
}


var optReferences = PS.when(o => 'references' in o).or(P.succeed({}));

var parsePrelude = PS.takeTill(isReleaseHeader)


function innerParser (parser) {
  return PS.co(function* () {
    let element = yield PS.any();
    let res = parser.parse(element)
    if (!res.status)
      yield P.fail('inner parser failed')

    return res.value;
  })
}

var parseHeader = PS.co(function* () {
  yield PS.token('header');
  let {level} = yield PS.any();
  let content = yield P.all;
  return {content, level}
});


var parseRelease = PS.co(function* () {
  let header = yield PS.when(isReleaseHeader)
  let titleElements = header.slice(2)
  let title = elementText(header);
  let release = extend({
    title: titleElements,
    // prelude: prelude,
  }, extractReleaseTitleInfo(title));
  let changeSections = yield sectionParser(3).many();

  forEach(changeSections, ({title, content}) => {
    release[title] = extractBulletList(content);
  });
  return release
})



function isReleaseHeader(el) {
  if (!isHeaderLevel(el, 2))
    return false;

  let text = elementText(el);
  return ( text.match(/^v?\d+\.\d+\.\d+/) ||
           text.match(UNRELEASED_RE));
}

/**
 * Takes a release title string and returns an object with the release
 * version and date.
 *
 * @example
 *   extractReleaseTitleInfo('v1.0.0 - 2014-01-01')
 *   // => {version: '1.0.0', date: '2014-01-01'}
 */
function extractReleaseTitleInfo(str) {
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

function sectionParser(sectionLevel) {
  return PS.co(function* () {
    let {level, content: title} = yield innerParser(parseHeader);
    if (level !== sectionLevel)
      yield P.fail()
    let content = yield PS.takeTill(isHeader)
    return {title, content}
  })
}

function extractBulletList(md) {
  var list = md[0];
  if (!(list && list[0] === 'bulletlist'))
    return null;

  return map(list.slice(1), function(item) {
    return item.slice(1);
  });
}

function isHeader(el) {
  return el && el[0] === 'header';
}

function isHeaderLevel (el, level) {
  return isHeader(el) && el[1].level === level;
}
