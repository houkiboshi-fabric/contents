'use strict';

const { createWriteStream } = require('fs');
const { relative } = require('path');

const consola = require('consola');
const { pack: tarPack } = require('tar-pack');
const rimraf = require('rimraf');

const clean = (target, baseDir) => {
  return new Promise(resolve => {
    consola.info('Cleaning...', relative(baseDir, target));
    rimraf(target, () => {
      consola.success('Cleaning has finished.');
      resolve();
    });
  });
};

const packSrc = (src, dist, baseDir) => {
  return new Promise((resolve, reject) => {
    consola.info('Saving archive...');
    tarPack(src)
      .pipe(createWriteStream(dist))
      .on('error', err => {
        consola.error(err);
        reject(err);
      })
      .on('close', () => {
        consola.success(
          'Saved archive:',
          relative(baseDir, src),
          '=>',
          relative(baseDir, dist)
        );
        resolve();
      });
  });
};

const pack = async ({ src, dist, baseDir }) => {
  await clean(dist, baseDir);
  await packSrc(src, dist, baseDir);
  await clean(src, baseDir);
};

module.exports = {
  pack
};
