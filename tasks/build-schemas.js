'use strict';

const consola = require('consola');

const buildSchemas = require('./lib/build-schemas.js');

(async () => {
  const { errors, results } = await buildSchemas();
  consola.success('Generated schemas:', results);
  if (errors.length > 0) {
    errors.forEach(err => consola.error(err));
  }
})();
