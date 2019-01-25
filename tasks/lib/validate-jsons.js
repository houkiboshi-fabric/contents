'use strict';

const { readFileSync } = require('fs');
const { basename, parse, resolve, relative } = require('path');

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

const createValidator = schemaPattern => {
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
  const validator = new Ajv({
    schemas,
    allErrors: true,
    logger: consola,
    validateSchema: true,
    meta: require('ajv/lib/refs/json-schema-draft-06.json')
  });

  return {
    errors,
    validator
  };
};

const validate = (data, validator, schemaId, path) => {
  const validation = validator.getSchema(schemaId);
  const isValid = validation(data);

  return {
    path,
    isValid,
    errors: validation.errors
  };
};

const validateJsons = ({ src, schemaDir, baseDir }) => {
  const errs = [];

  const schemaPattern = resolve(schemaDir, '*.json');
  const { errors, validator } = createValidator(schemaPattern);
  errs.push(...errors);

  const docPattern = resolve(src, '**', '*.json');
  const docPaths = glob.sync(docPattern);

  const results = docPaths.map(docPath => {
    const { error, result: doc } = readJson(docPath);

    if (error) {
      errs.push(error);
    }
    if (!doc.$schema) {
      errs.push({
        path: docPath,
        in: 'validateJsons',
        error: new Error('"$schema" property is missing.')
      });
    }

    const docSchemaId = basename(doc.$schema);
    return validate(doc, validator, docSchemaId, docPath);
  });

  errs.push(
    ...results
      .filter(v => !v.isValid)
      .map(v => {
        return {
          path: v.path,
          in: 'validateJsons',
          error: v.errors.map(err => err.message)
        };
      })
  );

  return {
    results,
    errors: errs.map(err => {
      return {
        ...err,
        path: relative(baseDir, err.path)
      };
    })
  };
};

module.exports = {
  validateJsons
};
