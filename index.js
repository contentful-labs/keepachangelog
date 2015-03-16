'use strict';

try {
  module.exports = require('./dist');
} catch (e) {
  if (e.code != 'MODULE_NOT_FOUND')
    throw e;
  require('babel/register');
  module.exports = require('./src');
}
