'use strict';

const { relative, resolve } = require('path');

const consola = require('consola');
const rimraf = require('rimraf');

const { buildContents } = require('./build-contents.js');
const { buildConfig } = require('./build-config.js');
const { buildSchemas } = require('../build-schemas');
const { formatDocs } = require('../format-docs.js');

const clean = (dist, baseDir) => {
  return new Promise(resolve => {
    consola.info('Cleaning...', relative(baseDir, dist));
    rimraf(dist, () => {
      consola.success('Cleaning has finished.');
      resolve();
    });
  });
};

const build = async ({
  src,
  dist,
  schemaDir,
  schemaUri,
  enumConfig,
  instructionsConfig,
  pagePathConfig,
  timeStampsConfig,
  joinJsonConfigs,
  baseDir
}) => {
  try {
    await clean(dist, baseDir);

    const { errors: bsErrors, results: bsResults } = await buildSchemas({
      src,
      dist: schemaDir,
      schemaUri,
      enumConfig,
      baseDir
    });

    const { errors: bcErrors, results: bcResults } = buildContents({
      src,
      dist,
      schemaDir,
      schemaUri,
      instructionsConfig,
      pagePathConfig,
      timeStampsConfig,
      joinJsonConfigs,
      baseDir
    });

    const { errors: bcfErrors, results: bcfResults } = buildConfig({
      src: resolve(src, 'config'),
      dist: resolve(dist, 'config'),
      schemaUri
    });

    const { errors: fdErrors, results: fdResults } = formatDocs(
      dist,
      schemaDir
    );

    return {
      errors: [...bsErrors, ...bcErrors, ...bcfErrors, ...fdErrors],
      results: {
        schemas: bsResults,
        built: [...new Set([...bcResults, ...bcfResults])],
        formatted: fdResults.map(p => relative(baseDir, p))
      }
    };
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  build
};
