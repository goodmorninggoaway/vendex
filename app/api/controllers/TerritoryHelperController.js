/**
 * TerritoryHelperController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  /**
   * `TerritoryHelperController.importLocations()`
   */
  importLocations: function (req, res) {
    const { congregationid } = req.headers;

    req.file('file').upload({ maxBytes: process.env.FILE_UPLOAD_MAX_BYTES }, (err, files) => {
      if (err) {
        return res.serverError(err);
      }

      if (!files.length) {
        return res.badRequest('Missing required "file" parameter; must be a file upload.');
      }

      TerritoryHelperService.importLocations({ congregationId: congregationid, file: files[0].fd }, (err, data) => {
        if (err) {
          return res.serverError(err);
        }

        return res.json(data);
      });
    });
  },

  /**
   * `TerritoryHelperController.importTerritories()`
   */
  importTerritories: async function (req, res) {
    const { congregationid } = req.headers;
    await TerritoryHelperService.importTerritories({ congregationId: congregationid, inputData: req.body }, (err, data) => {
      if (err) {
        return res.serverError(err);
      }

      return res.json(data);
    });
  },

  /**
   * `TerritoryHelperController.export()`
   */
  exportLocations: async function (req, res) {
    const { outputDirectory, congregationId } = req.body;
    await TerritoryHelperService.exportLocations({ congregationId, outputDirectory }, (err, data) => {
      if (err) {
        return res.serverError(err);
      }

      return res.json(data);
    });
  },

};

