'use strict';

const consola = require('consola');

const { build } = require('./lib/build.js');

const {
  dirs: { root, src, tmp }
} = require('./config.js');

(async () => {
  const { errors, results } = await build({
    src,
    dist: tmp,
    baseDir: root
  });
  consola.success(results);
  if (errors.length > 0) {
    throw new Error(errors);
  }
})();
