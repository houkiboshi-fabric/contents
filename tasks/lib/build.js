'use strict';

const { readFileSync, writeFileSync } = require('fs');
const { resolve, relative } = require('path');

const fetch = require('node-fetch');
const glob = require('glob');
const mkdirp = require('mkdirp');

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

const buildSchemas = dict => {
  mkdirp.sync(dirs.schemas);
  dict.forEach(item => {
    const path = resolve(dirs.schemas, item.schema.$id);
    const data = JSON.stringify(item.newSchema, null, 2);
    console.log(`Generated: ${relative(dirs.root, path)}`);
    writeFileSync(path, data);
  });
};

const buildIndexFiles = () => {
  const dirsToGenerateIndex = [...dirSchemaMap.keys()];
  dirsToGenerateIndex.forEach(dir => {
    const pattern = resolve(dirs.docs, dir, '**', '!(index).json');
    const contents = glob.sync(pattern).reduce((acm, path) => {
      const content = readFileSync(path, 'utf-8');
      return [...acm, JSON.parse(content)];
    }, []);
    const indexPath = resolve(dirs.docs, dir, 'index.json');
    console.log(`Generated index: ${relative(dirs.root, indexPath)}`);
    writeFileSync(indexPath, JSON.stringify(contents, null, 2));
  });
};

let schemaDict = null;

const build = async () => {
  if (!schemaDict) {
    schemaDict = await fetchSchemas();
  }
  const dict = generateNewSchema(schemaDict);
  buildSchemas(dict);
  buildIndexFiles();
};

module.exports = build;
