'use strict';

const { relative, resolve } = require('path');

const chokidar = require('chokidar');
const consola = require('consola');

const buildSchemas = require('./lib/build-schemas.js');
const validate = require('./lib/validate-json.js');

const { dirs } = require('./config.js');

const paths = [
  'dyeing-material-types',
  'dyeing-materials',
  'products',
  'raw-materials'
].map(path => resolve(dirs.src, path, '**', '*.json'));

const watcher = chokidar.watch(paths, {
  ignored: /(^|[/\\])\../,
  persistent: true,
  ignoreInitial: true
});

consola.info('Watching paths:', paths.map(path => relative(dirs.root, path)));

const buildSchemasAndValidate = async () => {
  const bs = await buildSchemas();

  consola.success('Generated schemas:', bs.results);

  const v = validate();
  if (v.errors.length === 0) {
    consola.success('All json files are valid!');
  }

  const errors = [...bs.errors, ...v.errors];
  if (errors.length > 0) {
    errors.forEach(err => consola.error(err));
  }
};

watcher
  .on('add', () => buildSchemasAndValidate())
  .on('change', () => buildSchemasAndValidate())
  .on('unlink', () => buildSchemasAndValidate());

buildSchemasAndValidate().catch(reason => consola.error(reason));
