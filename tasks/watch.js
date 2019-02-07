'use strict';

const { relative, resolve } = require('path');

const chokidar = require('chokidar');
const consola = require('consola');
const { TextLintEngine } = require('textlint');

const { buildSchemas } = require('./lib/build-schemas');
const { validateJsons } = require('./lib/validate-jsons.js');
const { lintContents } = require('./lib/lint-contents.js');

const { formatDocs } = require('./lib/format-docs.js');
const {
  dirs: { root, src, schemas },
  SCHEMA_URI,
  enumConfig
} = require('./config.js');

const watchPathPattern = resolve(src, '**', '*.{json,md}');
const engine = new TextLintEngine();

const runTasks = async (watcher, startWatching) => {
  const {
    errors: errorsInBuildSchemas,
    results: builtSchemas
  } = await buildSchemas({
    src,
    dist: schemas,
    schemaUri: SCHEMA_URI,
    enumConfig,
    baseDir: root
  });

  consola.success('Generated schemas:', builtSchemas);

  const { errors: errorsInValidateJson } = validateJsons({
    src,
    schemaDir: schemas,
    baseDir: root
  });
  if (errorsInValidateJson.length === 0) {
    consola.success('All json files are valid!');
  }

  const errors = [...errorsInBuildSchemas, ...errorsInValidateJson];
  if (errors.length > 0) {
    errors.forEach(err => consola.error(err));
  }

  watcher.close();

  const { results: formatResults } = formatDocs(src, schemas);

  if (formatResults.length > 0) {
    consola.success(
      'Formatted documents:',
      formatResults.map(p => relative(root, p))
    );
  }

  consola.info('Contents lint is processing...');
  const lintResults = await lintContents({
    jsonPattern: resolve(src, '**', '*.json'),
    mdPattern: resolve(src, '**', '*.md')
  }).catch(err => consola.error(err));
  const lintOutputs = engine.formatResults(
    lintResults.map(r => ({
      ...r,
      filePath: relative(root, r.filePath)
    }))
  );

  if (lintOutputs.length > 0) {
    consola.error(lintOutputs);
  } else {
    consola.success('All contents lint passed!');
  }

  startWatching();
};

const logError = err => consola.error(err);

const watchOptions = {
  ignored: /(^|[/\\])\../,
  persistent: true,
  ignoreInitial: true
};

const watcher = chokidar.watch(watchPathPattern, watchOptions);
const startWatching = () => {
  const watcher = chokidar.watch(watchPathPattern, watchOptions);
  watcher
    .on('add', () => runTasks(watcher, startWatching).catch(logError))
    .on('change', () => runTasks(watcher, startWatching).catch(logError))
    .on('unlink', () => runTasks(watcher, startWatching).catch(logError));
};

runTasks(watcher, startWatching).catch(logError);

consola.info('Watching paths:', relative(root, watchPathPattern));
