const fs = require('fs');
const importLocations = require('../domain/import-territory-helper');
const exportLocations = require('../domain/territoryHelper/export');
const importTerritories = require('../domain/import-territory-helper-territories');

module.exports = {
  async importLocations(options, done) {
    try {
      const fileStream = fs.createReadStream(options.file);
      const result = await importLocations(Object.assign({ fileStream }, options));
      fs.unlink(options.file, () => {
        return done(null, result);
      });
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

  async exportLocations(options, done) {
    try {
      return done(null, await exportLocations(options));
    } catch (ex) {
      return done(ex);
    }
  },

};
