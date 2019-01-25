'use strict';

const { relative } = require('path');

const consola = require('consola');

const { formatDocs } = require('./lib/format-docs.js');
const {
  dirs: { root, src, schemas }
} = require('./config.js');

const { errors, results } = formatDocs(src, schemas);

if (results.length > 0) {
  results.forEach(path => consola.success('Formatted:', relative(root, path)));
}

if (errors.length > 0) {
  errors.forEach(err => {
    consola.error(err);
  });
}
