'use strict';

const { resolve } = require('path');

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

exports.archiveDistPath = resolve(dist, 'contents.tar.gz');

exports.schemaConfigs = [
  {
    distDirName: 'dyeing-material-types',
    uri:
      'https://houkiboshi-fabric.github.io/schema/ref-parsed/dyeing-material-type.json'
  },
  {
    distDirName: 'dyeing-materials',
    uri:
      'https://houkiboshi-fabric.github.io/schema/ref-parsed/dyeing-material.json'
  },
  {
    distDirName: 'products',
    uri: 'https://houkiboshi-fabric.github.io/schema/ref-parsed/product.json'
  },
  {
    distDirName: 'raw-materials',
    uri:
      'https://houkiboshi-fabric.github.io/schema/ref-parsed/raw-material.json'
  }
];
