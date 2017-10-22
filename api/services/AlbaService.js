const importLocations = require('../domain/alba/import');

module.exports = {
  async importLocations(options, done) {
    try {
      return done(null, await importLocations(options));
    } catch (ex) {
      return done(ex);
    }
  },
};
