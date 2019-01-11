'use strict';

const consola = require('consola');

const validateAll = require('./lib/validate-json.js');

const { errors } = validateAll();

if (errors.length > 0) {
  consola.error(errors);
} else {
  consola.success('All json files are valid!');
}
