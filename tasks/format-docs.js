'use strict';

const { relative } = require('path');

const consola = require('consola');

const { formatDocs } = require('./lib/format-docs.js');
const {
  dirs: { root, src, schemas }
} = require('./config.js');

const { errors, results } = formatDocs(src, schemas);

if (results.length > 0) {
  consola.success(
    'Formatted files:',
    results.map(path => relative(root, path))
  );
  consola.info(
    'You might want to run `git add` to commit these formatted files.'
  );
  consola.warn('Format task will exit with code 1 to run `git add`.');
  process.on('exit', () => {
    process.exit(1);
  });
}

if (errors.length > 0) {
  errors.forEach(err => {
    consola.error(err);
  });
  process.on('exit', () => {
    process.exit(1);
  });
}
