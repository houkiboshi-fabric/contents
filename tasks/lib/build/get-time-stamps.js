'use strict';

const { execSync } = require('child_process');
const { DateTime } = require('luxon');

const getCommitTimeStamps = path => {
  const cmd = `git log --format=%aI --follow ${path}`;
  return execSync(cmd)
    .toString('utf-8')
    .split('\n')
    .filter(e => e)
    .map(timeStamp => {
      return DateTime.fromISO(timeStamp)
        .toUTC()
        .toISO();
    });
};

const getTimeStamps = path => {
  const timeStamps = getCommitTimeStamps(path);
  return {
    createdAt: timeStamps[timeStamps.length - 1],
    modifiedAt: timeStamps[0]
  };
};

module.exports = { getTimeStamps };
