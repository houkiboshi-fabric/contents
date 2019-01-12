'use strict';

const { mkdirSync, readFileSync, writeFileSync } = require('fs');
const { parse, resolve, relative } = require('path');

const consola = require('consola');
const glob = require('glob');
const rimraf = require('rimraf');

const { dirSchemaMap, dirs } = require('../config.js');
const { getTimeStamps } = require('./get-time-stamps.js');

const src = dirs.src;
const dist = dirs.dist;

const readJson = path => {
  const data = readFileSync(path, 'utf-8');
  let error;
  let result;

  try {
    error = null;
    result = JSON.parse(data);
  } catch (err) {
    error = err;
    result = null;
  }

  return {
    error,
    result
  };
};

const datasetDirNames = [...dirSchemaMap.keys()];

// src to dist
const buildDatasets = () => {
  consola.info('Building dataset files...');

  const errors = [];
  const results = [];

  const readJsonFile = path => {
    const { error, result } = readJson(path);
    if (error) {
      errors.push({
        path,
        in: 'buildDatasets',
        error
      });
      return null;
    }
    return {
      path,
      result
    };
  };

  const addTimeStamps = ({ path, result }) => {
    const { createdAt, modifiedAt } = getTimeStamps(path);

    if (!createdAt || !modifiedAt) {
      consola.error(path);
      throw new Error('Cannot get time stamps.');
    }

    return {
      path,
      result: {
        ...result,
        created_at: createdAt,
        modified_at: modifiedAt
      }
    };
  };

  const writeJsonFile = ({ path, result }) => {
    const json = JSON.stringify(result, null, 2);
    const distPath = path.replace(src, dist);
    const distDir = parse(distPath).dir;
    mkdirSync(distDir, { recursive: true });
    writeFileSync(distPath, json);
    results.push(relative(dirs.root, distPath));
  };

  datasetDirNames.forEach(dirName => {
    const pattern = resolve(src, dirName, '**', '*.json');
    glob
      .sync(pattern)
      .map(readJsonFile)
      .filter(e => e)
      .map(addTimeStamps)
      .forEach(writeJsonFile);
  });

  consola.success('Building dataset files has finished.');

  return {
    errors,
    results
  };
};

// dist to dist
const buildIndexFiles = () => {
  consola.info('Building index files...');

  const datasetDirNames = [...dirSchemaMap.keys()];
  const generated = [];
  const errors = [];

  datasetDirNames.forEach(dirName => {
    const pattern = resolve(dist, dirName, '**', '*.json');
    const docs = glob.sync(pattern).reduce((acm, path) => {
      const { error, result } = readJson(path);

      if (error) {
        errors.push({
          path,
          in: 'buildIndexFiles',
          error
        });
        return acm;
      }

      return [...acm, result];
    }, []);
    const distDir = resolve(dist, dirName);
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

const clean = () => {
  return new Promise(resolve => {
    consola.info('Cleaning...', relative(dirs.root, dist));
    rimraf(dist, () => {
      consola.success('Cleaning has finished.');
      resolve();
    });
  });
};

const build = async () => {
  await clean();
  const bd = buildDatasets();
  const bi = buildIndexFiles();
  return {
    errors: [...bd.errors, ...bi.errors],
    results: {
      'Generated dataset files': bd.results,
      'Generated index files': bi.results
    }
  };
};

module.exports = build;
