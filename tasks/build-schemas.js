'use strict';

const consola = require('consola');

const { buildSchemas } = require('./lib/build-schemas.js');
const {
  dirs: { root, src, schemas },
  SCHEMA_URI
} = require('./config.js');

(async () => {
  const { errors, results } = await buildSchemas({
    src,
    dist: schemas,
    schemaUri: SCHEMA_URI,
    baseDir: root
  });
  consola.success('Generated schemas:', results);
  if (errors.length > 0) {
    errors.forEach(err => consola.error(err));
  }
})();
