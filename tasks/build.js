'use strict';

const consola = require('consola');

const build = require('./lib/build.js');

(async () => {
  const { errors, results } = await build();
  consola.success(results);
  if (errors.length > 0) {
    throw new Error(errors);
  }
})();
