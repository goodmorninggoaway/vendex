const importLocations = require('../domain/import-alba');
const importTerritories = require('../domain/import-alba-territories');

module.exports = {
  async importLocations(options, done) {
    try {
      return done(null, await importLocations(options));
    } catch (ex) {
      return done(ex);
    }
  },

  async importTerritories(options, done) {
    try {
      return done(null, await importTerritories(options));
    } catch (ex) {
      return done(ex);
    }
  },

};
