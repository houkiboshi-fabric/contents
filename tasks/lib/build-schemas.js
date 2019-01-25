'use strict';

const { mkdirSync, readFileSync, writeFileSync } = require('fs');
const { basename, resolve, relative } = require('path');

const fetch = require('node-fetch');
const glob = require('glob');
const consola = require('consola');
const pluralize = require('pluralize');

const { addIdsAsEnum } = require('./add-ids-as-enum.js');
const { addDefaultSnippets } = require('./add-default-snippets.js');
const { diff } = require('./array-diff.js');

// ex.) 'product.json' => 'product_id'
const getPropertyNameFromId = schemaId => {
  const base = basename(schemaId, '.json');
  return `${base.replace(/-/g, '_')}_id`;
};

const pullDocIds = docDir => {
  const pattern = resolve(docDir, '**', '*.json');
  const errors = [];
  const results = glob
    .sync(pattern)
    .map(filePath => {
      const json = readFileSync(filePath, 'utf8');

      let doc;

      try {
        doc = JSON.parse(json);
      } catch (err) {
        errors.push({
          path: filePath,
          in: 'pullDocIds',
          error: err
        });
        return null;
      }

      if (!doc.id) {
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

const generateNewSchemas = (schemas, srcDir) => {
  const errors = [];
  const dict = schemas
    .map(schema => {
      const dirName = pluralize(basename(schema.$id, '.json'));
      const docPath = resolve(srcDir, dirName);
      const { errors: pullDocIdsErrors, results: ids } = pullDocIds(docPath);
      errors.push(...pullDocIdsErrors);

      return {
        schema,
        property: getPropertyNameFromId(schema.$id),
        ids
      };
    })
    .map(item => {
      return {
        ...item,
        pattern: new RegExp(`^${item.property}s?$`),
        values: item.ids
      };
    });

  const propValuesList = dict.map(({ pattern, values }) => {
    return {
      pattern,
      values
    };
  });

  const results = dict.map(({ schema, ids }) => {
    const addedEnum = addIdsAsEnum(schema, propValuesList);
    const addedSnippets = addDefaultSnippets(addedEnum);
    return {
      schema,
      newSchema: addedSnippets,
      ids
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

// Do not fetch while watching task is running
let schemas = null;

// Logging only diff while watching task is running
let prevIds = {};

const buildSchemas = async ({ src, dist, schemaUri, baseDir }) => {
  consola.info('Building schemas...');
  if (!schemas) {
    schemas = await fetch(schemaUri)
      .then(res => res.json())
      .then(schema => {
        return Object.keys(schema.properties).map(key => {
          return schema.properties[key];
        });
      })
      .catch(err => {
        throw new Error(err);
      });
  }

  const {
    results: newSchemas,
    errors: errorsInGenerateNewSchemas
  } = generateNewSchemas(schemas, src);

  newSchemas.forEach(({ schema: { $id }, ids }) => {
    const label = $id.replace('.json', '');
    const prev = prevIds[label];
    const { added, deleted } = diff(prev, ids);
    added.length > 0 && consola.success(`Added ids in ${label}:`, added);
    deleted.length > 0 && consola.success(`Deleted ids in ${label}:`, deleted);
    prevIds[label] = ids;
  });

  const errors = errorsInGenerateNewSchemas.map(err => {
    return {
      ...err,
      path: relative(baseDir, err.path)
    };
  });

  const results = writeSchemas(dist, newSchemas).map(p => relative(baseDir, p));
  consola.success('Building schemas has finished.');
  return {
    errors,
    results
  };
};

module.exports = {
  buildSchemas
};
