'use strict';

const { readFileSync, writeFileSync } = require('fs');
const { dirname } = require('path');

const glob = require('glob');
const { TextLintEngine, TextFixEngine } = require('textlint');

const sortByDirname = (a = { filePath: '' }, b) =>
  dirname(a.filePath).localeCompare(dirname(b.filePath));

const lintJsonDescriptions = async pattern => {
  const engine = new TextLintEngine();
  const promises = glob.sync(pattern).map(fPath => {
    const content = JSON.parse(readFileSync(fPath));
    if (!content.description) {
      return Promise.resolve();
    }
    return engine.executeOnText(content.description).then(results => {
      if (!engine.isErrorResults(results)) {
        return;
      }
      return {
        ...results[0],
        filePath: fPath
      };
    });
  });

  const results = await Promise.all(promises);
  return results.filter(r => r);
};

const fixJsonDescriptions = async pattern => {
  const engine = new TextFixEngine();
  const promises = glob.sync(pattern).map(fPath => {
    const content = JSON.parse(readFileSync(fPath));
    if (!content.description) {
      return Promise.resolve();
    }
    return engine.executeOnText(content.description).then(results => {
      if (!engine.isErrorResults(results)) {
        return;
      }
      return {
        ...results[0],
        filePath: fPath
      };
    });
  });

  const results = await Promise.all(promises);
  return results.filter(r => r);
};

const lintMdFiles = async pattern => {
  const engine = new TextLintEngine();
  const filePaths = glob.sync(pattern);
  return engine.executeOnFiles(filePaths).then(results => {
    if (!engine.isErrorResults(results)) {
      return;
    }
    return results;
  });
};

const fixMdFiles = async pattern => {
  const engine = new TextFixEngine();
  const filePaths = glob.sync(pattern);
  return engine.executeOnFiles(filePaths).then(results => {
    if (!engine.isErrorResults(results)) {
      return;
    }
    return results;
  });
};

const lintContents = async ({ jsonPattern, mdPattern }) => {
  const jsonResults = await lintJsonDescriptions(jsonPattern);
  const mdResults = await lintMdFiles(mdPattern);
  return [...jsonResults, ...mdResults].sort(sortByDirname);
};

const fixContents = async ({ jsonPattern, mdPattern }) => {
  const jsonResults = await fixJsonDescriptions(jsonPattern);
  const mdResults = await fixMdFiles(mdPattern);

  jsonResults.forEach(({ filePath, output }) => {
    const json = JSON.parse(readFileSync(filePath));
    writeFileSync(
      filePath,
      JSON.stringify(
        {
          ...json,
          description: output
        },
        null,
        2
      )
    );
  });

  mdResults.forEach(({ filePath, output }) => {
    writeFileSync(filePath, output);
  });

  return [...jsonResults, ...mdResults].sort(sortByDirname);
};

module.exports = {
  lintContents,
  fixContents
};
