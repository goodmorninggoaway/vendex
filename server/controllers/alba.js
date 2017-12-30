module.exports = {
  importLocations: {
    handler: async function (req, res) {
      const { congregationid } = req.headers;
      const importLocations = require('../../domain/alba/import');
      return importLocations({ congregationId: +congregationid, inputData: req.body });
    },
  },
};

