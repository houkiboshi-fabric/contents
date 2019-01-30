'use strict';

const consola = require('consola');

const { buildSchemas } = require('./lib/build-schemas');
const {
  dirs: { root, src, schemas },
  SCHEMA_URI,
  addingEnumConfig
} = require('./config.js');

(async () => {
  const { errors, results } = await buildSchemas({
    src,
    dist: schemas,
    schemaUri: SCHEMA_URI,
    addingEnumConfig,
    baseDir: root
  });
  consola.success('Generated schemas:', results);
  if (errors.length > 0) {
    errors.forEach(err => consola.error(err));
  }
})();
