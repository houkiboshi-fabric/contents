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

exports.SCHEMA_URI =
  'https://houkiboshi-fabric.github.io/schema/ref-parsed/index.json';

exports.archiveDistPath = resolve(dist, 'contents.tar.gz');
