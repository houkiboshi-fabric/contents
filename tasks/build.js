'use strict';

const consola = require('consola');

const { build } = require('./lib/build');

const {
  dirs: { root, src, schemas, tmp },
  SCHEMA_URI,
  enumConfig,
  pagePathConfig,
  timeStampsConfig,
  instructionsConfig,
  joinJsonConfigs
} = require('./config.js');

(async () => {
  const { errors, results } = await build({
    src,
    dist: tmp,
    schemaDir: schemas,
    schemaUri: SCHEMA_URI,
    enumConfig,
    pagePathConfig,
    timeStampsConfig,
    instructionsConfig,
    joinJsonConfigs,
    baseDir: root
  });

  consola.success(results);

  if (errors.length > 0) {
    errors.forEach(err => consola.error(err));
    throw new Error('Build failed.');
  }
})();
