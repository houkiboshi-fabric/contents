'use strict';

const { readdirSync, rmdirSync, statSync } = require('fs');
const { relative, resolve } = require('path');

const cleanEmptyDirs = (dirPath, baseDir) => {
  if (!statSync(dirPath).isDirectory()) {
    return;
  }
  const files = readdirSync(dirPath);

  if (files.length > 0) {
    files.forEach(file => {
      const fullPath = resolve(dirPath, file);
      cleanEmptyDirs(fullPath);
    });
  }

  // re-evaluate files; after deleting subfolder
  // we may have parent folder empty now
  if (files.length === 0 || readdirSync(dirPath).length === 0) {
    console.info(`Removing empty dir: ${relative(baseDir, dirPath)}`);
    rmdirSync(dirPath);
  }
  // NOOP
};

module.exports = {
  cleanEmptyDirs
};
