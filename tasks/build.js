'use strict';

const consola = require('consola');

const { build } = require('./lib/build.js');

const {
  schemaConfigs,
  dirs: { root, src, tmp }
} = require('./config.js');

const datasetDirNames = [...schemaConfigs.map(e => e.distDirName)];

(async () => {
  const { errors, results } = await build({
    src,
    dist: tmp,
    datasetDirNames,
    baseDir: root
  });
  consola.success(results);
  if (errors.length > 0) {
    throw new Error(errors);
  }
})();
