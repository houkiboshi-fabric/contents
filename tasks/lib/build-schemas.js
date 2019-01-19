'use strict';

const { mkdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve, relative } = require('path');

const fetch = require('node-fetch');
const glob = require('glob');
const consola = require('consola');

const { addIdsAsEnum } = require('./add-ids-as-enum.js');
const { addDefaultSnippets } = require('./add-default-snippets.js');
const { diff } = require('./array-diff.js');

const fetchSchema = uri => fetch(uri).then(response => response.json());
const fetchSchemas = async remoteSchemaConfigs => {
  return Promise.all(
    remoteSchemaConfigs.map(async ({ distDirName, uri }) => {
      try {
        const schema = await fetchSchema(uri);
        consola.success(`Fetched: ${uri}`);
        return {
          dir: distDirName,
          id: schema['$id'],
          schema
        };
      } catch (err) {
        throw new Error(err);
      }
    })
  );
};

const idToPropName = id => {
  return `${id.replace(/\..+$/, '').replace(/-/g, '_')}_id`;
};

const pullDocIds = docDir => {
  const pattern = resolve(docDir, '**', '*.json');
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

const generateNewSchemas = (fetchedSchemas, srcDir) => {
  const errs = [];
  const results = fetchedSchemas
    .map(fetchedSchema => {
      const docDir = resolve(srcDir, fetchedSchema.dir);
      const { errors, results: ids } = pullDocIds(docDir);
      errs.push(...errors);
      return {
        ...fetchedSchema,
        propName: idToPropName(fetchedSchema.id),
        ids
      };
    })
    .map((item, _i, dict) => {
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
let fetchedSchemas = null;

// Logging only diff while watching task is running
let prevIds = {};

const buildSchemas = async ({ src, dist, baseDir, schemaConfigs }) => {
  consola.info('Building schemas...');
  if (!fetchedSchemas) {
    fetchedSchemas = await fetchSchemas(schemaConfigs);
  }
  const { results: gnsResults, errors: gnsErrors } = generateNewSchemas(
    fetchedSchemas,
    src
  );

  gnsResults.forEach(({ schema: { $id }, ids }) => {
    const label = $id.replace('.json', '');
    const prev = prevIds[label];
    const { added, deleted } = diff(prev, ids);
    added.length > 0 && consola.success(`Added ids in ${label}:`, added);
    deleted.length > 0 && consola.success(`Deleted ids in ${label}:`, deleted);
    prevIds[label] = ids;
  });

  const errors = gnsErrors.map(err => {
    return {
      ...err,
      path: relative(baseDir, err.path)
    };
  });

  const results = writeSchemas(dist, gnsResults).map(p => relative(baseDir, p));
  consola.success('Building schemas has finished.');
  return {
    errors,
    results
  };
};

module.exports = {
  buildSchemas
};
