'use strict';

const { readFileSync } = require('fs');

const glob = require('glob');
const isPlainObject = require('lodash.isplainobject');
const cloneDeep = require('lodash.clonedeep');

const { resolve } = require('path');
const {
  dirs: { src }
} = require('../config.js');

const readJson = path => {
  try {
    const content = readFileSync(path, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    throw new Error(err);
  }
};

const joinEntityOf = (id, dataList, method) => {
  const entity = method(id, dataList);
  if (!entity) {
    throw new Error(`Cannot find entity of "${id}".`);
  }
  return entity;
};

const joinJson = ({ data, configs, dataList }) => {
  const properties = configs.map(c => c.property);
  const cloned = cloneDeep(data);

  const traverse = data => {
    if (Array.isArray(data)) {
      data.forEach(item => traverse(item));
    }
    if (isPlainObject(data)) {
      Object.keys(data).forEach(key => {
        const matched = properties.find(p => p === key);
        const value = data[key];

        if (matched) {
          const { refer, entityProperty } = configs.find(
            c => c.property === matched
          );
          const ids = data[matched];

          if (Array.isArray(ids)) {
            data[entityProperty] = ids.map(id => {
              return joinEntityOf(id, dataList, refer);
            });
            return;
          }

          data[entityProperty] = joinEntityOf(ids, dataList, refer);
        }

        return traverse(value);
      });
    }
  };

  traverse(cloned);
  return cloned;
};

module.exports = {
  joinJson
};
