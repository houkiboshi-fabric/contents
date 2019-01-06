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
].map(p => resolve(dirs.docs, p, '**', '!(index).json'));

const watcher = chokidar.watch(paths, {
  ignored: /(^|[/\\])\../,
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('add', () => build())
  .on('change', () => build())
  .on('unlink', () => build());
