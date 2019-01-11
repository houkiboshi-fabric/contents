const build = require('./lib/build.js');
const buildSchemas = require('./lib/build-schemas.js');

(async () => {
  await buildSchemas();
  build();
})();
