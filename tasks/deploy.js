'use strict';

const { resolve, relative } = require('path');

const consola = require('consola');
const ghpages = require('gh-pages');
const ghpagesClean = require('gh-pages/bin/gh-pages-clean.js');
const { copySync } = require('fs-extra');

const {
  dirs: { src, dist, root, schemas, tmp },
  archiveDistPath,
  SCHEMA_URI,
  addingEnumConfig,
  addInstructionsConfig,
  addPathPropertyConfig,
  addTimeStampsConfig,
  joinJsonConfigs
} = require('./config.js');
const { build } = require('./lib/build');
const { pack } = require('./lib/pack.js');

const additionalDeploymentTargets = ['.circleci'];

(async () => {
  const { errors, results } = await build({
    src,
    dist: tmp,
    schemaDir: schemas,
    schemaUri: SCHEMA_URI,
    addingEnumConfig,
    addInstructionsConfig,
    addPathPropertyConfig,
    addTimeStampsConfig,
    joinJsonConfigs,
    baseDir: root
  });

  consola.success(results);

  if (errors.length > 0) {
    errors.forEach(err => consola.error(err));
    throw new Error('Deployment failed.');
  }

  await pack({
    src: tmp,
    dist: archiveDistPath,
    baseDir: root
  });

  additionalDeploymentTargets
    .map(item => {
      return {
        src: resolve(root, item),
        dist: resolve(dist, item)
      };
    })
    .forEach(item => {
      try {
        copySync(item.src, item.dist);
        consola.success(
          'Copied:',
          relative(root, item.src),
          '=>',
          relative(root, item.dist)
        );
      } catch (err) {
        throw new Error(err);
      }
    });

  try {
    consola.info('Publishing...');
    const config = {
      branch: 'gh-pages',
      repo: 'git@github.com:houkiboshi-fabric/contents.git',
      remote: 'origin',
      message: 'Auto-generated commit',
      dotfiles: true
    };
    ghpagesClean();
    ghpages.publish(dist, config, err => {
      if (err) {
        throw new Error(err);
      }
      consola.success('Publishing has finished successfully.');
    });
  } catch (err) {
    throw new Error(err);
  }
})();
