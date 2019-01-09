'use strict';

const chokidar = require('chokidar');
const { resolve } = require('path');

const build = require('./build.js');
const validate = require('./validate-json.js');

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

const buildAndValidate = () => {
  build();
  validate();
};

watcher
  .on('add', () => buildAndValidate())
  .on('change', () => buildAndValidate())
  .on('unlink', () => buildAndValidate());
