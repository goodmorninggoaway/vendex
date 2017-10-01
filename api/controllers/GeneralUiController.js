/**
 * GeneralUiController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  /**
   * `AlbaUIController.importLocations()`
   */
  resetDatabase: function (req, res) {
    return res.view('general/reset');
  }

};

