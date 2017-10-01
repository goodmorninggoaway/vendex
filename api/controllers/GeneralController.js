const DAL = require('../domain/dataAccess').DAL;
/**
 * GeneralController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  /**
   * `GeneralController.resetDatabase()`
   */
  resetDatabase: function (req, res) {
    DAL.reset()
      .then(() => res.ok())
      .catch((err) => res.serverError(err));
  }

};

