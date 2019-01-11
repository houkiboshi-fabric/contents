'use strict';

const { resolve } = require('path');

const ROOT_DIR = resolve(__dirname, '..');

exports.dirs = {
  root: ROOT_DIR,
  src: resolve(ROOT_DIR, 'src'),
  docs: resolve(ROOT_DIR, 'docs'),
  schemas: resolve(ROOT_DIR, 'schemas')
};

exports.dirSchemaMap = new Map([
  [
    'dyeing-material-types',
    'https://houkiboshi-fabric.github.io/schema/ref-parsed/dyeing-material-type.json'
  ],
  [
    'dyeing-materials',
    'https://houkiboshi-fabric.github.io/schema/ref-parsed/dyeing-material.json'
  ],
  [
    'products',
    'https://houkiboshi-fabric.github.io/schema/ref-parsed/product.json'
  ],
  [
    'raw-materials',
    'https://houkiboshi-fabric.github.io/schema/ref-parsed/raw-material.json'
  ]
]);
