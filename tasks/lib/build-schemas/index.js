'use strict';

const { mkdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve, relative } = require('path');

const fetch = require('node-fetch');
const consola = require('consola');
const pluralize = require('pluralize');
const rimraf = require('rimraf');

const { addIdsAsEnum } = require('./add-ids-as-enum.js');
const { addDefaultSnippets } = require('./add-default-snippets.js');

const generateNewSchemas = (schemas, enumConfig) => {
  const errors = [];

  const readJson = path => {
    try {
      const doc = JSON.parse(readFileSync(path));
      return {
        error: null,
        result: doc
      };
    } catch (error) {
      errors.push(error);
      return {
        error,
        result: null
      };
    }
  };

  const propsAndIds = Object.keys(enumConfig).map(key => {
    const pullIds = enumConfig[key];
    const ids = pullIds(readJson);
    return {
      pattern: new RegExp(`(^${key}|${pluralize.singular(key)}$)`),
      values: ids
    };
  });

  const results = schemas.map(schema => {
    const addedEnum = addIdsAsEnum(schema, propsAndIds);
    const addedSnippets = addDefaultSnippets(addedEnum);
    return {
      schema,
      newSchema: addedSnippets
    };
  });

  return {
    errors,
    results
  };
};

const writeSchemas = (dist, dict) => {
  mkdirSync(dist, { recursive: true });
  return dict.map(item => {
    const path = resolve(dist, item.schema.$id);
    const data = JSON.stringify(item.newSchema, null, 2);
    writeFileSync(path, data);
    return path;
  });
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

// Do not fetch while watching task is running
let schemas = null;

const buildSchemas = async ({ dist, schemaUri, enumConfig, baseDir }) => {
  await clean(dist, baseDir);

  consola.info('Building schemas...');

  if (!schemas) {
    schemas = await fetch(schemaUri)
      .then(res => res.json())
      .then(schemas => {
        return schemas.map(({ value }) => value);
      })
      .catch(err => {
        throw new Error(err);
      });
  }

  const {
    results: buildSchemasResults,
    errors: buildSchemasErrors
  } = generateNewSchemas(schemas, enumConfig);

  const errors = buildSchemasErrors.map(err => {
    return {
      ...err,
      path: relative(baseDir, err.path)
    };
  });

  const results = writeSchemas(dist, buildSchemasResults).map(distPath =>
    relative(baseDir, distPath)
  );
  consola.success('Building schemas has finished.');
  return {
    errors,
    results
  };
};

module.exports = {
  buildSchemas
};
