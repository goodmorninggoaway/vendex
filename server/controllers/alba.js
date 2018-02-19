const importLocations = require('../../domain/alba/import');

module.exports = {
  importLocations: {
    handler: async function(req, res) {
      const { congregationId } = req.auth.credentials;

      return importLocations({
        congregationId,
        inputData: req.payload,
      });
    },
  },
};
