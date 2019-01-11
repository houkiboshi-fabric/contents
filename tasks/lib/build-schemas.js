'use strict';

const { mkdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve, relative } = require('path');

const fetch = require('node-fetch');
const glob = require('glob');

const { dirSchemaMap, dirs } = require('../config.js');
const { addIdsAsEnum } = require('./add-ids-as-enum.js');
const { addDefaultSnippets } = require('./add-default-snippets.js');

const fetchSchema = uri => fetch(uri).then(response => response.json());

const fetchSchemas = async () => {
  return Promise.all(
    [...dirSchemaMap.entries()].map(async ([dirName, uri]) => {
      console.log('Fetching', uri);
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
  const pattern = resolve(dirs.docs, schemaData.dir, '**', '!(index).json');
  return glob.sync(pattern).map(filePath => {
    const doc = JSON.parse(readFileSync(filePath, 'utf8'));
    return doc.id;
  });
};

const generateNewSchema = schemaDict => {
  return schemaDict
    .map(schemaData => {
      return {
        ...schemaData,
        propName: idToPropName(schemaData.id),
        ids: pullDocIds(schemaData)
      };
    })
    .map((item, _i, dict) => {
      console.log(`Found ids of ${item.propName}`, item.ids);
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
};

const writeSchemas = dict => {
  mkdirSync(dirs.schemas, { recursive: true });
  dict.forEach(item => {
    const path = resolve(dirs.schemas, item.schema.$id);
    const data = JSON.stringify(item.newSchema, null, 2);
    console.log(`Generated: ${relative(dirs.root, path)}`);
    writeFileSync(path, data);
  });
};

let schemaDict = null;

const buildSchemas = async () => {
  if (!schemaDict) {
    schemaDict = await fetchSchemas();
  }
  const dict = generateNewSchema(schemaDict);
  writeSchemas(dict);
};

module.exports = buildSchemas;
