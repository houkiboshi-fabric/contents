'use strict';

const {
  createWriteStream,
  mkdirSync,
  readFileSync,
  unlinkSync
} = require('fs');
const path = require('path');

require('dotenv-safe').config();

const { FTP_HOST, FTP_USER, FTP_PASSWORD } = process.env;

const consola = require('consola');
const { Client } = require('basic-ftp');

const { buildAssetIndex } = require('./build-asset-index.js');
const { compareAssetIndex } = require('./compare-asset-index.js');
const { cleanEmptyDirs } = require('./clean-empty-dirs.js');

const REMOTE_ROOT = 'houkiboshi-fabric/assets/';
const INDEX = 'index.json';
const INDEX_REMOTE = 'index.remote.json';
const FTP_CONFIG = {
  host: FTP_HOST,
  port: 21,
  user: FTP_USER,
  password: FTP_PASSWORD,
  secure: true
};

const cleanIndexFiles = (assetsDir, baseDir) => {
  consola.info('Removing index files...');
  [INDEX, INDEX_REMOTE].forEach(fileName => {
    const filePath = path.resolve(assetsDir, fileName);
    try {
      unlinkSync(filePath);
      consola.success(`Removed: ${path.relative(baseDir, filePath)}`);
    } catch (err) {
      consola.info(err);
    }
  });
};

const createFtpClient = () => {
  return new Client();
};

const download = async (remoteFileName, savingPath, client) => {
  await client.download(createWriteStream(savingPath), remoteFileName);
};

const downloadIndex = async (client, assetsDir, baseDir) => {
  try {
    const remoteIndexPath = path.resolve(assetsDir, INDEX_REMOTE);
    await download(INDEX, remoteIndexPath, client);
    consola.success(`Saved: ${path.relative(baseDir, remoteIndexPath)}`);
    return JSON.parse(readFileSync(remoteIndexPath, 'utf8'));
  } catch (err) {
    throw new Error(err);
  }
};

const deleteLocalFiles = (files = [], assetsDir, baseDir) => {
  files.forEach(filePath => {
    try {
      const p = path.resolve(assetsDir, filePath);
      unlinkSync(p);
      consola.success(`Removed local file: ${path.relative(baseDir, p)}`);
    } catch (err) {
      throw new Error(err);
    }
  });
};

const downloadRemoteFiles = async (
  files = [],
  client,
  remoteRoot,
  assetsDir,
  baseDir
) => {
  const jobs = files.map(filePath => {
    return async () => {
      try {
        const { dir, base } = path.parse(filePath);
        await client.cd(dir);
        mkdirSync(path.resolve(assetsDir, dir), { recursive: true });
        const localSavingPath = path.resolve(assetsDir, filePath);
        await download(base, localSavingPath, client);
        consola.success(`Saved: ${path.relative(baseDir, localSavingPath)}`);
        await client.cd(remoteRoot);
      } catch (err) {
        throw new Error(err);
      }
    };
  });

  await (async () => {
    for (const job of jobs) {
      await job();
    }
  })();
};

const updateAssets = async (assetsDir, baseDir) => {
  mkdirSync(assetsDir, { recursive: true });
  cleanIndexFiles(assetsDir, baseDir);

  const indexLocal = await buildAssetIndex(assetsDir, baseDir);
  const cli = createFtpClient();
  await cli.access(FTP_CONFIG);
  await cli.cd(REMOTE_ROOT);
  const remoteRoot = await cli.pwd();
  const indexRemote = await downloadIndex(cli, assetsDir, baseDir);
  const diff = compareAssetIndex(indexLocal, indexRemote);

  consola.info('Updates:');
  consola.debug(diff);
  deleteLocalFiles([...diff.updated, ...diff.deleted]);
  consola.info('Downloading assets from remote...');
  await downloadRemoteFiles(
    [...diff.added, ...diff.updated],
    cli,
    remoteRoot,
    assetsDir,
    baseDir
  );
  cli.close();
  consola.info('Connection closed');
  consola.info('Updating local index...');
  await buildAssetIndex(assetsDir, baseDir);
  cleanEmptyDirs(assetsDir, baseDir);
};

module.exports = {
  updateAssets
};
