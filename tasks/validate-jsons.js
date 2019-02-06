'use strict';

const consola = require('consola');

const { buildSchemas } = require('./lib/build-schemas');
const { validateJsons } = require('./lib/validate-jsons.js');

const {
  dirs: { root, src, schemas },
  SCHEMA_URI,
  enumConfig
} = require('./config.js');

(async () => {
  const {
    errors: errorsInBuildSchemas,
    results: builtSchemas
  } = await buildSchemas({
    src,
    dist: schemas,
    schemaUri: SCHEMA_URI,
    enumConfig,
    baseDir: root
  });

  consola.success('Generated schemas:', builtSchemas);

  if (errorsInBuildSchemas.length > 0) {
    errorsInBuildSchemas.forEach(err => consola.error(err));
  }

  const { errors: errorsInValidateJson } = validateJsons({
    src,
    schemaDir: schemas,
    baseDir: root
  });

  if (errorsInValidateJson.length > 0) {
    errorsInValidateJson.forEach(err => consola.error(err));
    process.on('exit', () => {
      process.exit(1);
    });
  } else {
    consola.success('All json files are valid!');
  }
})();
