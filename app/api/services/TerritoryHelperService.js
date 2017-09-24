const fs = require('fs');
const importLocations = require('../../../lib/public/import-territory-helper');
const exportLocations = require('../../../lib/public/export-territory-helper');
const importTerritories = require('../../../lib/public/import-territory-helper-territories');

module.exports = {
  async importLocations(options, done) {
    try {
      const fileStream = fs.createReadStream(options.file);
      const result = await importLocations(Object.assign({ fileStream }, options));
      fs.unlink(options.file, () => {
        done(null, result);
      });
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

  async exportLocations(options, done) {
    try {
      done(null, await exportLocations(options));
    } catch (ex) {
      done(ex);
    }
  },

};
