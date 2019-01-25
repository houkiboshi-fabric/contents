'use strict';

const { relative, resolve } = require('path');

const chokidar = require('chokidar');
const consola = require('consola');

const { buildSchemas } = require('./lib/build-schemas.js');
const { validateJsons } = require('./lib/validate-jsons.js');

const {
  dirs: { root, src, schemas },
  SCHEMA_URI
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
  const {
    errors: errorsInBuildSchemas,
    results: builtSchemas
  } = await buildSchemas({
    src,
    dist: schemas,
    schemaUri: SCHEMA_URI,
    baseDir: root
  });

  consola.success('Generated schemas:', builtSchemas);

  const { errors: errorsInValidateJson } = validateJsons({
    src,
    schemaDir: schemas,
    baseDir: root
  });
  if (errorsInValidateJson.length === 0) {
    consola.success('All json files are valid!');
  }

  const errors = [...errorsInBuildSchemas, ...errorsInValidateJson];
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
