'use strict';

const { mkdirSync, readFileSync, writeFileSync } = require('fs');
const { basename, dirname, parse, resolve, relative } = require('path');

const consola = require('consola');
const glob = require('glob');
const rimraf = require('rimraf');

const { getTimeStamps } = require('./get-time-stamps.js');

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

// src to dist
const buildContents = ({ src, dist, baseDir }) => {
  consola.info('Building content files...');

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

  const changeSchemaPathToRemote = ({ path, result }) => {
    return {
      path,
      result: {
        ...result,
        $schema: `${dirname(schemaUri)}/${basename(result.$schema)}`
      }
    };
  };

  const writeJsonFile = ({ path, result }) => {
    const json = JSON.stringify(result, null, 2);
    const distPath = path.replace(src, dist);
    const distDir = parse(distPath).dir;
    mkdirSync(distDir, { recursive: true });
    writeFileSync(distPath, json);
    results.push(relative(baseDir, distPath));
  };

  const pattern = resolve(src, '**', '*.json');

  glob
    .sync(pattern)
    .map(readJsonFile)
    .filter(e => e)
    .map(addTimeStamps)
    .map(changeSchemaPathToRemote)
    .forEach(writeJsonFile);

  consola.success('Building content files has finished.');

  return {
    errors,
    results
  };
};

const clean = (dist, baseDir) => {
  return new Promise(resolve => {
    consola.info('Cleaning...', relative(baseDir, dist));
    rimraf(dist, () => {
      consola.success('Cleaning has finished.');
      resolve();
    });
  });
};

const build = async ({ src, dist, baseDir }) => {
  try {
    await clean(dist, baseDir);
    const { errors, results } = buildContents({ src, dist, baseDir });
    return {
      errors,
      results: {
        'Generated content files': results
      }
    };
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  build
};
