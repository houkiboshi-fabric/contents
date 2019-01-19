'use strict';

const { relative, resolve } = require('path');

const chokidar = require('chokidar');
const consola = require('consola');

const { buildSchemas } = require('./lib/build-schemas.js');
const { validateJson } = require('./lib/validate-json.js');

const {
  dirs: { root, src, schemas },
  schemaConfigs
} = require('./config.js');

const paths = [
  'dyeing-material-types',
  'dyeing-materials',
  'products',
  'raw-materials'
].map(path => resolve(src, path, '**', '*.json'));

const watcher = chokidar.watch(paths, {
  ignored: /(^|[/\\])\../,
  persistent: true,
  ignoreInitial: true
});

const buildSchemasAndValidate = async () => {
  const bs = await buildSchemas({
    src,
    dist: schemas,
    baseDir: root,
    schemaConfigs
  });

  consola.success('Generated schemas:', bs.results);

  const v = validateJson({
    src,
    schemaDir: schemas,
    schemaConfigs,
    baseDir: root
  });
  if (v.errors.length === 0) {
    consola.success('All json files are valid!');
  }

  const errors = [...bs.errors, ...v.errors];
  if (errors.length > 0) {
    errors.forEach(err => consola.error(err));
  }
};

const logError = err => consola.error(err);

watcher
  .on('add', () => buildSchemasAndValidate().catch(logError))
  .on('change', () => buildSchemasAndValidate().catch(logError))
  .on('unlink', () => buildSchemasAndValidate().catch(logError));

buildSchemasAndValidate().catch(logError);

consola.info('Watching paths:', paths.map(path => relative(root, path)));
