'use strict';

const chokidar = require('chokidar');
const { resolve } = require('path');

const build = require('./build.js');
const { dirs } = require('./config.js');

const paths = [
  'dyeing-material-types',
  'dyeing-materials',
  'products',
  'raw-materials'
].map(p => resolve(dirs.docs, p, '**', '*.json'));

const watcher = chokidar.watch(paths, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true
});

const log = console.log.bind(console);

watcher
  .on('add', path => build())
  .on('change', path => build())
  .on('unlink', path => build());
