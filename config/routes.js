/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {


  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  '/': {
    view: 'homepage'
  },

  'GET /ui/congregations/:congregationId': 'GeneralUIController.getCongregation',
  'POST /ui/congregations/:congregationId': 'GeneralUIController.updateCongregation',
  'GET /ui/congregations/:congregationId/delete': 'GeneralUIController.deleteCongregation',
  'GET /ui/congregations': 'GeneralUIController.listCongregations',
  'POST /ui/congregations': 'GeneralUIController.createCongregation',

  'GET /ui/languages': { view: 'language/list' },

  'GET /ui/reset': 'GeneralUIController.resetDatabase',
  'GET /ui/alba/locations': 'AlbaUIController.importLocations',
  'GET /ui/territoryhelper/locations': 'TerritoryHelperUIController.importLocations',
  'GET /ui/territoryhelper/territories': 'TerritoryHelperUIController.importTerritories',
  'GET /ui/territoryhelper/export': 'TerritoryHelperUIController.exportLocations',

  'DELETE /reset': 'GeneralController.resetDatabase',

  'POST /alba/locations': 'AlbaController.importLocations',

  'POST /territoryhelper/territories': 'TerritoryHelperController.importTerritories',
  'POST /territoryhelper/locations': 'TerritoryHelperController.importLocations',
  'GET /territoryhelper/locations': 'TerritoryHelperController.exportLocations',


  /***************************************************************************
   *                                                                          *
   * Custom routes here...                                                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the custom routes above, it   *
   * is matched against Sails route blueprints. See `config/blueprints.js`    *
   * for configuration options and examples.                                  *
   *                                                                          *
   ***************************************************************************/

};
