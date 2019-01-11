'use strict';

const { resolve } = require('path');

const chokidar = require('chokidar');
const consola = require('consola');

const build = require('./lib/build.js');
const buildSchemas = require('./lib/build-schemas.js');
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
  const bs = await buildSchemas();

  consola.success('Generated schemas:', bs.results);

  const b = build();

  consola.success('Generated index files:', b.results);

  const v = validate();
  if (v.errors.length === 0) {
    consola.success('All json files are valid!');
  }

  const errors = [...bs.errors, ...b.errors, ...v.errors];
  if (errors.length > 0) {
    errors.forEach(err => consola.error(err));
  }
};

watcher
  .on('add', () => buildAndValidate())
  .on('change', () => buildAndValidate())
  .on('unlink', () => buildAndValidate());

buildAndValidate().catch(reason => consola.error(reason));
