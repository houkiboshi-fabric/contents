'use strict';

const consola = require('consola');

const { buildSchemas } = require('./lib/build-schemas.js');
const {
  dirs: { root, src, schemas },
  schemaConfigs
} = require('./config.js');

(async () => {
  const { errors, results } = await buildSchemas({
    src,
    dist: schemas,
    baseDir: root,
    schemaConfigs
  });
  consola.success('Generated schemas:', results);
  if (errors.length > 0) {
    errors.forEach(err => consola.error(err));
  }
})();
