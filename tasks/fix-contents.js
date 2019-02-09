'use strict';

const { relative, resolve } = require('path');

const { TextFixEngine } = require('textlint');
const consola = require('consola');

const { fixContents } = require('./lib/lint-contents.js');

const {
  dirs: { root, src }
} = require('./config.js');

(async () => {
  consola.info('Contents lint is processing...');
  const engine = new TextFixEngine();
  const results = await fixContents({
    jsonPattern: resolve(src, '**', '*.json'),
    mdPattern: resolve(src, '**', '*.md')
  });

  const output = engine.formatResults(
    results.map(r => ({
      ...r,
      filePath: relative(root, r.filePath)
    }))
  );

  if (output.length > 0) {
    consola.error(output);
    process.on('exit', () => {
      process.exit(1);
    });
  }

  consola.success('All contents lint passed!');
})();
