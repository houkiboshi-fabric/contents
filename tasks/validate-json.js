'use strict';

const consola = require('consola');

const { buildSchemas } = require('./lib/build-schemas.js');
const { validateJson } = require('./lib/validate-json.js');

const {
  dirs: { root, src, schemas },
  schemaConfigs
} = require('./config.js');

(async () => {
  const bs = await buildSchemas({
    src,
    dist: schemas,
    baseDir: root,
    schemaConfigs
  });

  consola.success('Generated schemas:', bs.results);

  if (bs.errors.length > 0) {
    bs.errors.forEach(err => consola.error(err));
  }

  const v = validateJson({
    src,
    schemaDir: schemas,
    schemaConfigs,
    baseDir: root
  });

  if (v.errors.length > 0) {
    consola.error(v.errors);
  } else {
    consola.success('All json files are valid!');
  }
})();
