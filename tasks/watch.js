'use strict';

const { relative, resolve } = require('path');

const chokidar = require('chokidar');
const consola = require('consola');
const { TextLintEngine } = require('textlint');

const { buildSchemas } = require('./lib/build-schemas');
const { validateJsons } = require('./lib/validate-jsons.js');
const { lintContents } = require('./lib/lint-contents.js');

const {
  dirs: { root, src, schemas },
  SCHEMA_URI,
  enumConfig
} = require('./config.js');

const watchPathPattern = resolve(src, '**', '*.{json,md}');
const engine = new TextLintEngine();

const runTasks = async () => {
  consola.info('Start tasks...');
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

  consola.info('Tasks completed.');
  consola.info('Watching paths:', relative(root, watchPathPattern));
  return Promise.resolve();
};

const logError = err => consola.error(err);

const watchOptions = {
  ignored: /(^|[/\\])\../,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    pollInterval: 250,
    stabilityThreshold: 500
  }
};

const startWatching = () => {
  const watcher = chokidar.watch(watchPathPattern, watchOptions);

  watcher
    .on('add', path => {
      consola.info(`A file added ${relative(root, path)}`);
      runTasks(watcher, startWatching).catch(logError);
    })
    .on('change', path => {
      consola.info(`A file changed ${relative(root, path)}`);
      runTasks(watcher, startWatching).catch(logError);
    })
    .on('unlink', () => runTasks(watcher, startWatching).catch(logError))
    .on('error', err => consola.error(err));
};

(async () => {
  await runTasks().catch(logError);
  startWatching();
})();
