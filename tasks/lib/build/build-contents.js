'use strict';

const { copyFileSync, mkdirSync, writeFileSync } = require('fs');
const { basename, dirname, parse, resolve, relative } = require('path');
const { URL } = require('url');

const consola = require('consola');
const glob = require('glob');

const { readJson } = require('./read-json.js');
const { getTimeStamps } = require('./get-time-stamps.js');
const { joinJson } = require('./join-json.js');

// src to dist
const buildContents = ({
  src,
  dist,
  schemaUri,
  instructionsConfig,
  joinJsonConfigs,
  pagePathConfig,
  timeStampsConfig,
  baseDir
}) => {
  consola.info('Building content files...');

  const errors = [];
  const results = [];

  const readJsonFile = path => {
    const { error, result } = readJson(path);
    if (error) {
      errors.push({
        path,
        in: 'buildContents',
        error
      });
      return null;
    }
    return {
      path,
      result
    };
  };

  const addInstructions = ({ path, result }, _i, dataList) => {
    if (result.$schema && basename(result.$schema) !== 'product.json') {
      return {
        path,
        result
      };
    }
    const {
      result: { instructions: allInstructions }
    } = dataList.find(
      d => d.path === resolve(src, 'config', 'instructions.json')
    );
    const instructions = instructionsConfig.instructions
      .filter(({ condition }) => condition(result))
      .map(({ instructionId }) =>
        allInstructions.find(({ id }) => id === instructionId)
      );
    return {
      path,
      result: {
        ...result,
        instructions: {
          ...result.instructions,
          items: instructions
        }
      }
    };
  };

  const addPathProperty = ({ path, result }) => {
    if (pagePathConfig.exclude.length > 0) {
      const shouldExclude = pagePathConfig.exclude.some(ePath => {
        return path.startsWith(ePath);
      });
      if (shouldExclude) {
        return {
          path,
          result
        };
      }
    }

    const localPath = path.replace(src, '');
    const pagePath = new URL(localPath, 'relative:///').pathname
      .replace('index.json', '')
      .replace(/(.)\/$/, '$1'); // Remove trailing slash except for root page '/'
    return {
      path,
      result: {
        ...result,
        path: pagePath
      }
    };
  };

  const addTimeStamps = ({ path, result }) => {
    if (timeStampsConfig.exclude.length > 0) {
      const shouldExclude = timeStampsConfig.exclude.some(ePath => {
        return path.startsWith(ePath);
      });
      if (shouldExclude) {
        return {
          path,
          result
        };
      }
    }

    const { createdAt, modifiedAt } = getTimeStamps(path, baseDir);

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

  const replaceSchemaPathToRemote = ({ path, result }) => {
    if (!result.$schema) {
      throw new Error('Cannot find "$schema" property.');
    }
    const replaced = `${dirname(schemaUri)}/${basename(result.$schema)}`;
    return {
      path,
      result: {
        ...result,
        $schema: replaced
      }
    };
  };

  const joinJsons = ({ path, result: data }, _i, dataList) => {
    return {
      path,
      result: joinJson({ data, configs: joinJsonConfigs, dataList })
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

  const jsonPattern = resolve(src, '**', '*.json');
  const filePattern = resolve(src, '**', '*.!(json)');

  glob
    .sync(jsonPattern)
    .map(readJsonFile)
    .filter(e => e)
    .map(addInstructions)
    .map(addPathProperty)
    .map(addTimeStamps)
    .map(replaceSchemaPathToRemote)
    .map(joinJsons)
    .forEach(writeJsonFile);

  glob.sync(filePattern).forEach(srcPath => {
    const distPath = srcPath.replace(src, dist);
    copyFileSync(srcPath, distPath);
    results.push(relative(baseDir, distPath));
  });

  consola.success('Building content files has finished.');

  return {
    errors,
    results
  };
};

module.exports = {
  buildContents
};
