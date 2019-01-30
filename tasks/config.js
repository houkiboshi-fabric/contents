'use strict';

const { resolve } = require('path');

const glob = require('glob');

const root = resolve(__dirname, '..');
const src = resolve(root, 'src');
const dist = resolve(root, 'dist');
const schemas = resolve(root, 'schemas');
const tmp = resolve(dist, 'contents');

exports.dirs = {
  root,
  src,
  dist,
  schemas,
  tmp
};

exports.SCHEMA_URI =
  'https://houkiboshi-fabric.github.io/schema/ref-parsed/index.json';

exports.archiveDistPath = resolve(dist, 'contents.tar.gz');

const pullIdsFromIndex = (dirPath, readJson) => {
  const pattern = resolve(dirPath, '**', 'index.json');
  return glob
    .sync(pattern)
    .map(path => {
      const { result, error } = readJson(path);
      if (error) return;
      return result.id;
    })
    .filter(e => e);
};

exports.addingEnumConfig = {
  dyeing_material_ids: readJson => {
    const dirPath = resolve(src, 'dyeing-materials');
    return pullIdsFromIndex(dirPath, readJson);
  },
  dyeing_material_type_ids: readJson => {
    const dirPath = resolve(src, 'dyeing-material-types');
    return pullIdsFromIndex(dirPath, readJson);
  },
  raw_material_ids: readJson => {
    const dirPath = resolve(src, 'raw-materials');
    return pullIdsFromIndex(dirPath, readJson);
  },
  tag_ids: readJson => {
    const dirPath = resolve(src, 'blog', 'tags');
    return pullIdsFromIndex(dirPath, readJson);
  }
};

exports.joinJsonConfigs = [
  {
    property: 'dyeing_material_type_id',
    refer: (id, dataList) => {
      const found = dataList.find(({ result }) => {
        return (
          result.id === id &&
          /dyeing-material-type\.json$/i.test(result.$schema)
        );
      });
      return found.result;
    },
    entityProperty: 'dyeing_material_type_entity'
  },
  {
    property: 'dyeing_material_ids',
    refer: (id, dataList) => {
      const found = dataList.find(({ result }) => {
        return (
          result.id === id && /dyeing-material\.json/i.test(result.$schema)
        );
      });
      return found.result;
    },
    entityProperty: 'dyeing_material_entities'
  },
  {
    property: 'raw_material_ids',
    refer: (id, dataList) => {
      const found = dataList.find(({ result }) => {
        return result.id === id && /raw-material\.json/i.test(result.$schema);
      });
      return found.result;
    },
    entityProperty: 'raw_material_entities'
  },
  {
    property: 'tag_ids',
    refer: (id, dataList) => {
      const found = dataList.find(({ result }) => {
        return result.id === id && /tag\.json/i.test(result.$schema);
      });
      return found.result;
    },
    entityProperty: 'tag_entities'
  }
];
