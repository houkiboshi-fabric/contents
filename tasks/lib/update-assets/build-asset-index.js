'use strict';

const { writeFileSync } = require('fs');
const { relative, resolve } = require('path');

const glob = require('glob');
const hasha = require('hasha');
const consola = require('consola');

const buildAssetIndex = async (assetsDir, baseDir) => {
  const PATTERN = resolve(assetsDir, '**', '*.*');
  const INDEX = 'index.json';

  const files = glob.sync(PATTERN, {
    nodir: true
  });
  const index = files.map(filePath => {
    return {
      path: relative(assetsDir, filePath),
      hash: hasha.fromFileSync(filePath)
    };
  });
  try {
    const indexPath = resolve(assetsDir, INDEX);
    writeFileSync(indexPath, JSON.stringify(index, null, 2));
    consola.success(`Saved: ${relative(baseDir, indexPath)}`);
  } catch (err) {
    throw new Error(err);
  }
  return index;
};

module.exports = {
  buildAssetIndex
};
