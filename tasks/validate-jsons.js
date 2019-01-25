'use strict';

const consola = require('consola');

const { buildSchemas } = require('./lib/build-schemas.js');
const { validateJsons } = require('./lib/validate-jsons.js');

const {
  dirs: { root, src, schemas },
  SCHEMA_URI
} = require('./config.js');

(async () => {
  const bs = await buildSchemas({
    src,
    dist: schemas,
    schemaUri: SCHEMA_URI,
    baseDir: root
  });

  consola.success('Generated schemas:', bs.results);

  if (bs.errors.length > 0) {
    bs.errors.forEach(err => consola.error(err));
  }

  const v = validateJsons({
    src,
    schemaDir: schemas,
    baseDir: root
  });

  if (v.errors.length > 0) {
    consola.error(v.errors);
  } else {
    consola.success('All json files are valid!');
  }
})();
