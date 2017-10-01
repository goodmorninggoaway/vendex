/**
 * AlbaController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  /**
   * `AlbaController.importLocations()`
   */
  importLocations: async function (req, res) {
    const { congregationid } = req.headers;

    AlbaService.importLocations({ congregationId: congregationid, inputData: req.body }, (err, data) => {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      }

      return res.json(data);
    });
  },

  /**
   * `AlbaController.importTerritories()`
   */
  importTerritories: async function (req, res) {
    const { congregationid } = req.headers;
    await AlbaService.importTerritories({ congregationId: congregationid, inputData: req.body }, (err, data) => {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      }

      return res.json(data);
    });
  },

};

