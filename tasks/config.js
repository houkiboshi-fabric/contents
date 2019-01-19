'use strict';

const { resolve } = require('path');

const ROOT_DIR = resolve(__dirname, '..');

exports.dirs = {
  root: ROOT_DIR,
  src: resolve(ROOT_DIR, 'src'),
  dist: resolve(ROOT_DIR, 'dist'),
  schemas: resolve(ROOT_DIR, 'schemas')
};

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
