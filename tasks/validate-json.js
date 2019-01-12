'use strict';

const consola = require('consola');

const buildSchemas = require('./lib/build-schemas.js');
const validateAll = require('./lib/validate-json.js');

(async () => {
  const bs = await buildSchemas();

  consola.success('Generated schemas:', bs.results);

  if (bs.errors.length > 0) {
    bs.errors.forEach(err => consola.error(err));
  }

  const v = validateAll();

  if (v.errors.length > 0) {
    consola.error(v.errors);
  } else {
    consola.success('All json files are valid!');
  }
})();
