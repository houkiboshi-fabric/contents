'use strict';

const { readFileSync, writeFileSync } = require('fs');
const { basename, resolve } = require('path');

const prettier = require('prettier');
const glob = require('glob');

const sortDocProperties = (doc, orderList) => {
  return orderList.reduce((acm, key) => {
    if (typeof doc[key] === 'undefined') {
      return acm;
    }
    return {
      ...acm,
      [key]: doc[key]
    };
  }, {});
};

const formatDocs = (srcDir, schemasDir) => {
  const results = [];
  const schemaPattern = resolve(schemasDir, '**', '*.json');
  const schemaMap = glob.sync(schemaPattern).reduce((acm, path) => {
    const schema = JSON.parse(readFileSync(path));
    return {
      ...acm,
      [schema.$id]: schema
    };
  }, {});
  const docPattern = resolve(srcDir, '**', '*.json');
  glob.sync(docPattern).forEach(path => {
    const docString = readFileSync(path, 'utf8');
    const doc = JSON.parse(docString);
    const schemaId = basename(doc.$schema);
    const schema = schemaMap[schemaId];
    const schemaOrderList = Object.keys(schema.properties);
    const sorted = sortDocProperties(doc, schemaOrderList);
    const formatted = prettier.format(JSON.stringify(sorted, null, 2) + '\n', {
      parser: 'json'
    });

    const hasModified = formatted !== docString;

    if (hasModified) {
      writeFileSync(path, formatted);
      results.push(path);
    }
  });

  return { results };
};

module.exports = {
  formatDocs
};
