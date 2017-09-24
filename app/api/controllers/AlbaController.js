/**
 * AlbaController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  /**
   * `AlbaController.importTerritories()`
   */
  importTerritories: async function (req, res) {
    const { file, congregationId } = req.body;
    await AlbaService.importTerritories({ congregationId, file }, (err, data) => {
      if (err) {
        return res.serverError(err);
      }

      return res.json(data);
    });
  },

  /**
   * `AlbaController.importLocations()`
   */
  importLocations: async function (req, res) {
    const { file, congregationId } = req.body;
    await AlbaService.importLocations({ congregationId, file }, (err, data) => {
      if (err) {
        return res.serverError(err);
      }

      return res.json(data);
    });
  },

  /**
   * `AlbaController.export()`
   */
  exportLocations: function (req, res) {
    return res.json({
      todo: 'export() is not implemented yet!'
    });
  }

};

