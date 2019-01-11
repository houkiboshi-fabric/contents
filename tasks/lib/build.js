'use strict';

const { mkdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve, relative } = require('path');

const glob = require('glob');
const consola = require('consola');

const { dirSchemaMap, dirs } = require('../config.js');

const datasetDirNames = [...dirSchemaMap.keys()];
const buildIndexFiles = () => {
  consola.info('Building index files...');

  const datasetDirNames = [...dirSchemaMap.keys()];
  const generated = [];
  const errors = [];

  datasetDirNames.forEach(dirName => {
    const pattern = resolve(dirs.src, dirName, '**', '*.json');
    const docs = glob.sync(pattern).reduce((acm, path) => {
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
    const distDir = resolve(dirs.docs, dirName);
    const distPath = resolve(distDir, 'index.json');
    mkdirSync(distDir, { recursive: true });
    writeFileSync(distPath, JSON.stringify(docs, null, 2));
    generated.push(distPath);
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
