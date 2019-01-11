'use strict';

const consola = require('consola');

const build = require('./lib/build.js');
const buildSchemas = require('./lib/build-schemas.js');

(async () => {
  const bs = await buildSchemas();

  consola.success('Generated schemas:', bs.results);

  const b = build();
  const errors = [...bs.errors, ...b.errors];

  consola.success('Generated index files:', b.results);

  if (errors.length > 0) {
    errors.forEach(err => consola.error(err));
  }
})();
