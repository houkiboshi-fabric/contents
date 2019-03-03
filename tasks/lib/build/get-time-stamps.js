'use strict';

const { execSync } = require('child_process');
const { DateTime } = require('luxon');

const FORMAT = '%aI';

const getCommittedAt = (gitLogArgs, cwd = process.cwd()) => {
  return execSync(`git log --format=${FORMAT} ${gitLogArgs}`, { cwd })
    .toString('utf-8')
    .split('\n')
    .filter(e => e)
    .map(timeStamp => {
      return DateTime.fromISO(timeStamp).toUTC();
    });
};

const getTimeStamps = path => {
  const cmdArgs = `--follow ${path}`;
  const timeStamps = getCommittedAt(cmdArgs);
  return {
    createdAt: timeStamps[timeStamps.length - 1].toISO(),
    modifiedAt: timeStamps[0].toISO()
  };
};

const getFirstCommittedAt = () => {
  const cmdArgs = `--reverse`;
  return getCommittedAt(cmdArgs)[0];
};

const getLastCommittedAt = () => {
  const cmdArgs = `--max-count 1`;
  return getCommittedAt(cmdArgs)[0];
};

module.exports = {
  getTimeStamps,
  getFirstCommittedAt,
  getLastCommittedAt
};
