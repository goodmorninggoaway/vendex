const importLocations = require('../domain/pipelines/alba/import');

module.exports = {
  async importLocations(options, done) {
    try {
      return done(null, await importLocations(options));
    } catch (ex) {
      return done(ex);
    }
  },
};
