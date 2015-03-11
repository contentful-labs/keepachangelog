'use strict';

var {map, capitalize} = require('lodash-node');
var semver = require('semver');

/**
 * Create a markdown string from a changelog structure.
 */
export default function renderChangelog(cl) {
  var rendered =
         buildMarkdown(cl.prelude) + '\n' +
         buildReleases(cl.releases) + '\n' +
         buildMarkdown(cl.epilogue);
  return rendered.trim() + '\n';
}


function buildMarkdown(md) {
  if (md)
    return md.map(buildElement).join('');
  else
    return '';
}


function buildElement(el) {
  if (typeof el == 'string')
    return el;

  var tagName = el.shift();
  if (tagName == 'header')
    return buildHeader(el);
  if (tagName == 'para')
    return buildPara(el);
  if (tagName == 'inlinecode')
    return buildInlinecode(el);
  else
    throw new Error(`Unknown tag ${tagName}`);
}


function buildHeader(el) {
  var {level} = el.shift();
  var title = buildMarkdown(el);
  var header = map(new Array(level),() => '#').join('');
  return header + ' ' + title + '\n';
}


function buildPara(el) {
  return buildMarkdown(el) + '\n';
}


function buildInlinecode(el) {
  return '`' + el.join('') + '`';
}


function buildReleases(releases) {
  return map(releases, (release) => {
    var title = getReleaseTitle(release);
    return buildHeader([{level: 2}, title]) +
           buildVersionLog('Added', release) +
           buildVersionLog('Changed', release) +
           buildVersionLog('Removed', release);
  }).join('');
}

function getReleaseTitle({title, version}) {
  if (title)
    return title;

  if (semver.valid(version))
    return 'v' + version;

  return capitalize(version);
}

function buildVersionLog(name, release) {
  var log = release[name];
  if (!log)
    return '';

  var header = buildHeader([{level: 3}, name]);
  var list = map(log, (entry) => '- ' + buildMarkdown(entry));
  return header + list.join('\n') + '\n\n';
}
