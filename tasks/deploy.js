'use strict';

const { resolve, relative } = require('path');

const consola = require('consola');
const ghpages = require('gh-pages');
const ghpagesClean = require('gh-pages/bin/gh-pages-clean.js');
const { copySync } = require('fs-extra');

const {
  dirs: { dist, root }
} = require('./config.js');
const build = require('./lib/build.js');

const additionalDeploymentTargets = ['.circleci'];

(async () => {
  const { errors, results } = await build();

  consola.success(results);

  if (errors.length > 0) {
    throw new Error(errors);
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
        consola.error(err);
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
})();
