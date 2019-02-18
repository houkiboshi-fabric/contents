'use strict';

const { updateAssets } = require('./lib/update-assets');

const {
  dirs: { root, assets }
} = require('./config.js');

updateAssets(assets, root);
