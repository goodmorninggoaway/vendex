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

  '/': 'UI.homepage',
  '/ui': 'UI.homepage',

  'GET /ui/congregations/:congregationId': 'UI.getCongregation',
  'POST /ui/congregations/:congregationId': 'UI.updateCongregation',
  'GET /ui/congregations/:congregationId/delete': 'UI.deleteCongregation',
  'GET /ui/congregations': 'UI.listCongregations',
  'POST /ui/congregations': 'UI.createCongregation',

  'POST /ui/congregationintegrations': 'UI.addCongregationIntegration',
  'GET /ui/congregationintegrations/:sourceCongregationId/:destinationCongregationId/delete': 'UI.deleteCongregationIntegration',

  'GET /ui/languages/:languageId': 'UI.getlanguage',
  'POST /ui/languages/:languageId': 'UI.updatelanguage',
  'GET /ui/languages/:languageId/delete': 'UI.deletelanguage',
  'GET /ui/languages': 'UI.listlanguages',
  'POST /ui/languages': 'UI.createlanguage',

  'GET /ui/reset': { view: 'general/reset' },
  'GET /ui/alba/locations': { view: 'alba/importLocations' },
  'GET /ui/territoryhelper/locations': { view: 'territoryHelper/importLocations' },
  'GET /ui/territoryhelper/territories': { view: 'territoryHelper/importTerritories' },
  'GET /ui/territoryhelper/exports': 'UI.getTerritoryHelperExportHistory',
  'GET /ui/territoryhelper/exports/download': 'UI.downloadTerritoryHelperExport',
  'GET /ui/territoryhelper/exports/:exportId/download': 'UI.downloadTerritoryHelperExport',
  'GET /ui/territoryhelper/exports/:exportId': 'UI.getTerritoryHelperExport',

  'DELETE /reset': 'UIController.resetDatabase',

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
