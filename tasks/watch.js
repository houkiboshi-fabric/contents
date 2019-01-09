'use strict';

const chokidar = require('chokidar');
const { resolve } = require('path');

const build = require('./lib/build.js');
const validate = require('./lib/validate-json.js');

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

const buildAndValidate = async () => {
  await build();
  validate();
};

watcher
  .on('add', () => buildAndValidate())
  .on('change', () => buildAndValidate())
  .on('unlink', () => buildAndValidate());

buildAndValidate();
