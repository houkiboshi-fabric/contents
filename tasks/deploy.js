'use strict';

const consola = require('consola');
const ghpages = require('gh-pages');
const ghpagesClean = require('gh-pages/bin/gh-pages-clean.js');

const {
  dirs: { dist }
} = require('./config.js');
const build = require('./lib/build.js');

(async () => {
  const { errors, results } = await build();

  consola.success(results);

  if (errors.length > 0) {
    throw new Error(errors);
  }

  consola.info('Publishing...');
  const config = {
    branch: 'gh-pages',
    repo: 'git@github.com:houkiboshi-fabric/contents.git',
    remote: 'origin',
    message: 'Auto-generated commit'
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
