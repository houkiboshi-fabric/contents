'use strict';

const { readFileSync } = require('fs');
const { basename, parse, resolve, relative } = require('path');

const Ajv = require('ajv');
const jsonSchemaDraft06 = require('ajv/lib/refs/json-schema-draft-06.json');
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
    meta: jsonSchemaDraft06
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
  const { errors: createValidatorErrors, validator } = createValidator(
    schemaPattern
  );
  errs.push(...createValidatorErrors);

  const docPattern = resolve(src, '**', '*.json');
  const docPaths = glob.sync(docPattern);

  const results = docPaths.reduce((acm, docPath) => {
    const { error: readJsonError, result: doc } = readJson(docPath);

    if (readJsonError) {
      errs.push({
        path: docPath,
        in: 'readJson',
        error: readJsonError
      });
      return acm;
    }
    if (!doc.$schema) {
      errs.push({
        path: docPath,
        in: 'validateJsons',
        error: new Error('"$schema" property is missing.')
      });
      return acm;
    }

    const docSchemaId = basename(doc.$schema);
    return [...acm, validate(doc, validator, docSchemaId, docPath)];
  }, []);

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
