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

const pullIdsFromIndex = (dirName, readJson) => {
  const pattern = resolve(src, dirName, '**', 'index.json');
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
    return pullIdsFromIndex('dyeing-materials', readJson);
  },
  dyeing_material_type_ids: readJson => {
    return pullIdsFromIndex('dyeing-material-types', readJson);
  },
  raw_material_ids: readJson => {
    return pullIdsFromIndex('raw-materials', readJson);
  },
  tag_ids: readJson => {
    const { result, error } = readJson(resolve(src, 'config', 'tags.json'));
    if (error) return;
    return result.tags.map(tag => tag.id);
  }
};

