'use strict';

const { writeFileSync } = require('fs');
const { basename, dirname, resolve } = require('path');
const cloneDeep = require('lodash.clonedeep');

const {
  getFirstCommittedAt,
  getLastCommittedAt
} = require('./get-time-stamps.js');
const { readJson } = require('./read-json.js');

const fileNames = {
  author: 'author.json',
  website: 'website.json',
  social: 'social.json'
};

const buildAuthorJson = (authorJson, socialJson, schemaUri) => {
  return {
    ...authorJson,
    $schema: `${dirname(schemaUri)}/${basename(authorJson.$schema)}`,
    sameAs: socialJson.accounts.map(a => a.uri)
  };
};

const buildWebsiteJson = (websiteJson, author, schemaUri) => {
  const firstCommittedAt = getFirstCommittedAt();
  const lastCommittedAt = getLastCommittedAt();
  const authorForWebsite = cloneDeep(author);

  delete authorForWebsite['$schema'];
  delete authorForWebsite['@context'];

  return {
    ...websiteJson,
    $schema: `${dirname(schemaUri)}/${basename(websiteJson.$schema)}`,
    dateCreated: firstCommittedAt.toISO(),
    datePublished: firstCommittedAt.toISO(),
    dateModified: lastCommittedAt.toISO(),
    author: authorForWebsite,
    publisher: authorForWebsite,
    encoding: {
      '@type': 'MediaObject',
      encodingFormat: 'utf-8'
    },
    copyrightHolder: authorForWebsite,
    copyrightYear: firstCommittedAt.year
  };
};

const buildConfig = ({ src, dist, schemaUri }) => {
  const results = [];
  const errors = [];

  const { error: authorJsonError, result: authorJson } = readJson(
    resolve(src, fileNames.author)
  );
  const { error: siteJsonError, result: websiteJson } = readJson(
    resolve(src, fileNames.website)
  );
  const { error: socialJsonError, result: socialJson } = readJson(
    resolve(src, fileNames.social)
  );

  const author = buildAuthorJson(authorJson, socialJson, schemaUri);
  const website = buildWebsiteJson(websiteJson, author, schemaUri);

  const data = {
    author,
    website
  };

  Object.keys(data).forEach(key => {
    const distPath = resolve(dist, fileNames[key]);
    writeFileSync(distPath, JSON.stringify(data[key], null, 2));
    results.push(distPath);
  });

  return {
    results,
    errors: [authorJsonError, siteJsonError, socialJsonError, ...errors].filter(
      e => e
    )
  };
};

module.exports = {
  buildConfig
};
