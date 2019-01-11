'use strict';

const { readFileSync } = require('fs');
const { parse, resolve, relative } = require('path');

const Ajv = require('ajv');
const consola = require('consola');
const glob = require('glob');

const { dirs, dirSchemaMap } = require('../config.js');

const jsonDirs = [...dirSchemaMap.keys()];

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

// Exclude ref-parsed json from validation targets
const schemaPattern = resolve(dirs.schemas, '*.json');

const createAjv = () => {
  const errors = [];
  const schemas = glob.sync(schemaPattern).map(filePath => {
    const { error, result } = readJson(filePath);
    if (error) {
      errors.push({
        path: filePath,
        error
      });
    }
    return result;
  });
  const ajv = new Ajv({
    schemas,
    allErrors: true,
    logger: consola,
    validateSchema: true,
    meta: require('ajv/lib/refs/json-schema-draft-06.json')
  });

  return {
    errors,
    ajv
  };
};

const validate = (data, ajv, schemaId, path) => {
  const validation = ajv.getSchema(schemaId);
  const isValid = validation(data);

  return {
    path,
    isValid,
    errors: validation.errors
  };
};

const validateAll = () => {
  const errs = [];
  const { errors, ajv } = createAjv();
  errs.push(...errors);

  const validations = jsonDirs.reduce((acm, dirName) => {
    const pattern = resolve(dirs.docs, dirName, '**', '!(index).json');
    const jsonPaths = glob.sync(pattern);
    const jsons = jsonPaths.map(filePath => {
      const { error, result } = readJson(filePath);
      if (error) {
        errors.push({
          path: filePath,
          in: 'validateAll',
          error
        });
      }
      return result;
    });

    const result = jsons.map((json, i) => {
      const jsonPath = jsonPaths[i];
      const schemaId = parse(dirSchemaMap.get(dirName)).base;
      return validate(json, ajv, schemaId, jsonPath);
    });

    return [...acm, ...result];
  }, []);

  errs.push(
    ...validations
      .filter(v => !v.isValid)
      .map(v => {
        return {
          path: v.path,
          in: 'validateAll',
          error: v.errors.map(err => err.message)
        };
      })
  );

  return {
    results: validations,
    errors: errs.map(err => {
      return {
        ...err,
        path: relative(dirs.root, err.path)
      };
    })
  };
};

module.exports = validateAll;
