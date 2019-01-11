'use strict';

const { mkdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve, relative } = require('path');

const fetch = require('node-fetch');
const glob = require('glob');
const consola = require('consola');

const { dirSchemaMap, dirs } = require('../config.js');
const { addIdsAsEnum } = require('./add-ids-as-enum.js');
const { addDefaultSnippets } = require('./add-default-snippets.js');

const fetchSchema = uri => fetch(uri).then(response => response.json());

const fetchSchemas = async () => {
  return Promise.all(
    [...dirSchemaMap.entries()].map(async ([dirName, uri]) => {
      consola.log('Fetching: ', uri);
      const schema = await fetchSchema(uri);
      return {
        dir: dirName,
        id: schema['$id'],
        schema
      };
    })
  );
};

const idToPropName = id => {
  return `${id.replace(/\..+$/, '').replace(/-/g, '_')}_id`;
};

const pullDocIds = schemaData => {
  const pattern = resolve(dirs.src, schemaData.dir, '**', '*.json');
  const errors = [];
  const results = glob
    .sync(pattern)
    .map(filePath => {
      const file = readFileSync(filePath, 'utf8');

      let doc;

      try {
        doc = JSON.parse(file);
      } catch (err) {
        errors.push({
          path: filePath,
          in: 'pullDocIds',
          error: err
        });
        return null;
      }

      if (!doc.id) {
        errors.push({
          path: filePath,
          in: 'pullDocIds',
          error: 'Property "id" is missing.'
        });
        return null;
      }

      return doc.id;
    })
    .filter(e => e);

  return {
    errors,
    results
  };
};

const generateNewSchemas = schemaDict => {
  const errs = [];
  const results = schemaDict
    .map(schemaData => {
      const { errors, results } = pullDocIds(schemaData);
      errs.push(...errors);
      return {
        ...schemaData,
        propName: idToPropName(schemaData.id),
        ids: results
      };
    })
    .map((item, _i, dict) => {
      consola.log(`Found ids of ${item.propName}`, item.ids); // TODO
      const propValuesList = dict.map(item => {
        return {
          pattern: new RegExp(`^${item.propName}s?$`),
          values: item.ids
        };
      });
      const idAdded = addIdsAsEnum(item.schema, propValuesList);
      const newSchema = addDefaultSnippets(idAdded);
      return {
        ...item,
        newSchema
      };
    });

  return {
    errors: errs,
    results
  };
};

const writeSchemas = dict => {
  mkdirSync(dirs.schemas, { recursive: true });
  return dict.map(item => {
    const path = resolve(dirs.schemas, item.schema.$id);
    const data = JSON.stringify(item.newSchema, null, 2);
    writeFileSync(path, data);
    return path;
  });
};

let schemaDict = null;

const buildSchemas = async () => {
  consola.info('Building schemas...');
  if (!schemaDict) {
    schemaDict = await fetchSchemas();
  }
  const generatedSchemas = generateNewSchemas(schemaDict);
  const dict = generatedSchemas.results;
  const errors = generatedSchemas.errors.map(err => {
    return {
      ...err,
      path: relative(dirs.root, err.path)
    };
  });
  const results = writeSchemas(dict).map(p => relative(dirs.root, p));
  consola.success('Building schemas has finished.');
  return {
    errors,
    results
  };
};

module.exports = buildSchemas;
