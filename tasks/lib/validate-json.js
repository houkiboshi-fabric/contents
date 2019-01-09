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
  return JSON.parse(data);
};

// Exclude ref-parsed json from validation targets
const schemaPattern = resolve(dirs.schemas, '*.json');

const createAjv = () => {
  const schemas = glob.sync(schemaPattern).map(readJson);
  return new Ajv({
    schemas,
    allErrors: true,
    logger: consola,
    validateSchema: true,
    meta: require('ajv/lib/refs/json-schema-draft-06.json')
  });
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
  const ajv = createAjv();

  const validations = jsonDirs.reduce((acm, dirName) => {
    const pattern = resolve(dirs.docs, dirName, '**', '!(index).json');
    const jsonPaths = glob.sync(pattern);
    const jsons = jsonPaths.map(readJson);

    const result = jsons.map((json, i) => {
      const jsonPath = jsonPaths[i];
      const schemaId = parse(dirSchemaMap.get(dirName)).base;
      return validate(json, ajv, schemaId, relative(dirs.root, jsonPath));
    });

    return [
      ...acm,
      ...result
    ];
  }, []);

  if (validations.some(v => !v.isValid)) {
    const errors = validations.filter(v => !v.isValid);
    errors.forEach(err =>
      consola.error(err.path, err.errors.map(error => error.message))
    );
    return;
  }
  consola.success('All json files are valid!');
};

module.exports = validateAll;
