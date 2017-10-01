/**
 * AlbaUIController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {


  /**
   * `AlbaUIController.importLocations()`
   */
  importLocations: function (req, res) {
    return res.view('alba/importLocations');
  }

};

