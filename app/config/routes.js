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

  'POST /alba/territories': 'AlbaController.importTerritories',
  'POST /alba/locations': 'AlbaController.importLocations',
  'GET /alba/locations': 'AlbaController.exportLocations',

  'POST /territoryhelper/territories': 'TerritoryHelperController.importTerritories',
  'POST /territoryhelper/locations': 'TerritoryHelperController.importLocations',
  'POST /territoryhelper/locations/export': 'TerritoryHelperController.exportLocations',


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
