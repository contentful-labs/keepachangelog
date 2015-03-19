'use strict';

var entryPoint = './dist'

try {
  require.resolve(entryPoint)
} catch (e) {
  require('babel/register');
  entryPoint = './src';
}

module.exports = require(entryPoint);
