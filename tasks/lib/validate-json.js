'use strict';

const { readFileSync } = require('fs');
const { parse, resolve, relative } = require('path');

const Ajv = require('ajv');
const consola = require('consola');
const glob = require('glob');

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

const createAjv = schemaPattern => {
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

const validateJson = ({ src, schemaDir, schemaConfigs, baseDir }) => {
  const errs = [];
  const schemaPattern = resolve(schemaDir, '*.json'); // Exclude ref-parsed json from validation targets
  const { errors, ajv } = createAjv(schemaPattern);
  errs.push(...errors);

  const dirNames = schemaConfigs.map(e => e.distDirName);

  const validations = dirNames.reduce((acm, dirName) => {
    const pattern = resolve(src, dirName, '**', '*.json');
    const jsonPaths = glob.sync(pattern);
    const jsons = jsonPaths.map(filePath => {
      const { error, result } = readJson(filePath);
      if (error) {
        errors.push({
          path: filePath,
          in: 'validateJson',
          error
        });
      }
      return result;
    });

    const result = jsons.map((json, i) => {
      const jsonPath = jsonPaths[i];
      const { uri } = schemaConfigs.find(c => c.distDirName === dirName);
      const schemaId = parse(uri).base;
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
          in: 'validateJson',
          error: v.errors.map(err => err.message)
        };
      })
  );

  return {
    results: validations,
    errors: errs.map(err => {
      return {
        ...err,
        path: relative(baseDir, err.path)
      };
    })
  };
};

module.exports = {
  validateJson
};
