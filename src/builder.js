'use strict';

var {map, capitalize} = require('lodash-node');
var semver = require('semver');

/**
 * Create a markdown string from a changelog structure.
 */
export default function renderChangelog(cl) {
  var rendered =
         buildElementList(cl.prelude) + '\n' +
         buildReleases(cl.releases) + '\n' +
         buildElementList(cl.epilogue);
  return rendered.trim() + '\n';
}


function buildElementList(md, sep) {
  sep = sep || '';
  if (md)
    return md.map(buildElement).join(sep);
  else
    return '';
}


/**
 * Build a JsonML element
 *
 * element
 *    = [ tag-name , attributes , element-list ]
 *    | [ tag-name , attributes ]
 *    | [ tag-name , element-list ']
 *    | [ tag-name ]
 *    | string
 *    ;
 */
function buildElement(el) {
  if (typeof el == 'string')
    return el;

  var tagName = el.shift();
  if (tagName == 'header')
    return buildHeader(el);
  else if (tagName == 'para')
    return buildPara(el);
  else if (tagName == 'inlinecode')
    return buildAndSurroundElementList('`', el);
  else if (tagName == 'em')
    return buildAndSurroundElementList('*', el);
  else
    throw new Error(`Unknown tag ${tagName}`);
}


function buildHeader(el) {
  var {level} = el.shift();
  var title = buildElementList(el);
  var header = repeat(level, '#');
  return header + ' ' + title + '\n';
}


function buildPara(el) {
  return buildElementList(el) + '\n';
}


function buildAndSurroundElementList (marker, els) {
  return marker + buildElementList(els) + marker;
}


function buildReleases(releases) {
  return map(releases, (release) => {
    var title = getReleaseTitle(release);
    return buildHeader([{level: 2}, title]) +
           buildVersionLog('Added', release) +
           buildVersionLog('Changed', release) +
           buildVersionLog('Removed', release) +
           buildVersionLog('Deprecated', release) +
           buildVersionLog('Fixed', release) +
           buildVersionLog('Security', release);
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
  var list = map(log, (entry) => {
    return '- ' + indent(buildElementList(entry), 2).trim();
  });
  return header + list.join('\n') + '\n\n';
}


function indent(str, width) {
  return map(str.split('\n'), (line) => repeat(width, ' ') + line).join('\n')
}


function repeat(n, x) {
  return map(new Array(n), () => x).join('');
}
