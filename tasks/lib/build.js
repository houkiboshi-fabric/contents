'use strict';

const { mkdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve, relative } = require('path');

const glob = require('glob');
const consola = require('consola');

const { dirSchemaMap, dirs } = require('../config.js');

const buildIndexFiles = () => {
  consola.info('Building index files...');

  const dirsToGenerateIndex = [...dirSchemaMap.keys()];
  const generated = [];
  const errors = [];

  dirsToGenerateIndex.forEach(dir => {
    const pattern = resolve(dirs.src, dir, '**', '*.json');
    const contents = glob.sync(pattern).reduce((acm, path) => {
      const content = readFileSync(path, 'utf-8');

      let doc;

      try {
        doc = JSON.parse(content);
      } catch (error) {
        errors.push({
          path,
          in: 'buildIndexFiles',
          error
        });
        return acm;
      }

      return [...acm, doc];
    }, []);
    const distDirPath = resolve(dirs.docs, dir);
    const indexPath = resolve(distDirPath, 'index.json');
    mkdirSync(distDirPath, { recursive: true });
    writeFileSync(indexPath, JSON.stringify(contents, null, 2));
    generated.push(indexPath);
  });

  consola.success('Building index files has finished.');

  return {
    errors: errors.map(err => {
      return {
        ...err,
        path: relative(dirs.root, err.path)
      };
    }),
    results: generated.map(p => relative(dirs.root, p))
  };
};

const build = () => {
  return buildIndexFiles();
};

module.exports = build;
