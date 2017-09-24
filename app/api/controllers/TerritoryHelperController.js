/**
 * TerritoryHelperController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  /**
   * `TerritoryHelperController.importTerritories()`
   */
  importTerritories: async function (req, res) {
    const { file, congregationId } = req.body;
    await TerritoryHelperService.importTerritories({ congregationId, file }, (err, data) => {
      if (err) {
        return res.serverError(err);
      }

      return res.json(data);
    });
  },

  /**
   * `TerritoryHelperController.importLocations()`
   */
  importLocations: async function (req, res) {
    const { file, congregationId } = req.body;
    await TerritoryHelperService.importLocations({ congregationId, file }, (err, data) => {
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

