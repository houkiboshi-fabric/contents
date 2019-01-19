'use strict';

const { resolve, relative } = require('path');

const consola = require('consola');
const ghpages = require('gh-pages');
const ghpagesClean = require('gh-pages/bin/gh-pages-clean.js');
const { copySync } = require('fs-extra');

const {
  dirs: { src, dist, root },
  schemaConfigs
} = require('./config.js');
const { build } = require('./lib/build.js');

const additionalDeploymentTargets = ['.circleci'];
const datasetDirNames = schemaConfigs.map(e => e.distDirName);

(async () => {
  try {
    const { errors, results } = await build({
      src,
      dist,
      baseDir: root,
      datasetDirNames
    });

    consola.success(results);

    if (errors.length > 0) {
      return new Error(errors);
    }

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
          consola.success(`Copied: ${relative(root, item.dist)}`);
        } catch (err) {
          throw new Error(err);
        }
      });

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
        consola.error(err);
        return;
      }
      consola.success('Publishing has finished successfully.');
    });
  } catch (err) {
    throw new Error(err);
  }
})();
