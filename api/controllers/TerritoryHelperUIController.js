/**
 * TerritoryHelperUIController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {


  /**
   * `TerritoryHelperUIController.importLocations()`
   */
  importLocations: function (req, res) {
    return res.view('territoryHelper/importLocations');
  },

  /**
   * `TerritoryHelperUIController.exportLocations()`
   */
  exportLocations: function (req, res) {
    return res.view('territoryHelper/exportLocations');
  },

  /**
   * `TerritoryHelperUIController.importTerritories()`
   */
  importTerritories: function (req, res) {
    return res.view('territoryHelper/importTerritories');
  }

};

