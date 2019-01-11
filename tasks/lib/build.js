'use strict';

const { readFileSync, writeFileSync } = require('fs');
const { resolve, relative } = require('path');

const glob = require('glob');

const { dirSchemaMap, dirs } = require('../config.js');

const buildIndexFiles = () => {
  const dirsToGenerateIndex = [...dirSchemaMap.keys()];
  dirsToGenerateIndex.forEach(dir => {
    const pattern = resolve(dirs.docs, dir, '**', '!(index).json');
    const contents = glob.sync(pattern).reduce((acm, path) => {
      const content = readFileSync(path, 'utf-8');
      return [...acm, JSON.parse(content)];
    }, []);
    const indexPath = resolve(dirs.docs, dir, 'index.json');
    console.log(`Generated index: ${relative(dirs.root, indexPath)}`);
    writeFileSync(indexPath, JSON.stringify(contents, null, 2));
  });
};

const build = () => {
  buildIndexFiles();
};

module.exports = build;
