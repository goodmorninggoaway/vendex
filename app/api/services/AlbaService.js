const importLocations = require('../../../lib/public/import-alba');
const importTerritories = require('../../../lib/public/import-alba-territories');

module.exports = {
  async importLocations(options, done) {
    try {
      done(null, await importLocations(options));
    } catch (ex) {
      done(ex);
    }
  },

  async importTerritories(options, done) {
    try {
      done(null, await importTerritories(options));
    } catch (ex) {
      done(ex);
    }
  },

};
