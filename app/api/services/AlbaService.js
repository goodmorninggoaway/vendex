const importLocations = require('../../../lib/public/import-alba');
// const exportLocations = require('../../../lib/public/export-alba');
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

  // async exportLocations(options, done) {
  //   try {
  //     done(null, await exportLocations(options));
  //   } catch (ex) {
  //     done(ex);
  //   }
  // },

};
