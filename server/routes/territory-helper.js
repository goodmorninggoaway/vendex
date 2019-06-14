exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/territory-helper');
    server.route([
      {
        method: 'POST',
        path: '/locations',
        options: Controller.importLocations,
      },
      {
        method: 'POST',
        path: '/forward-conversions',
        options: Controller.exportLocations,
      },
      {
        method: 'GET',
        path: '/forward-conversions',
        options: Controller.getExportHistory,
      },
      {
        method: 'GET',
        path: '/get-latest-export',
        options: Controller.getLatestExport,
      },
      {
        method: 'GET',
        path: '/territory-conflicts',
        options: Controller.getTerritoryConflicts,
      },
      {
        method: 'PATCH',
        path: '/resolve-territory-conflicts',
        options: Controller.resolveTerritoryConflicts,
      },
      {
        method: 'PATCH',
        path: '/update-export-summary/{exportActivityId}',
        options: Controller.updateExportActivitySummary,
      },
      {
        method: 'POST',
        path: '/territories',
        options: Controller.importTerritories,
      },
      {
        method: 'GET',
        path: '/authorize',
        options: Controller.authorize,
      },
      {
        method: 'GET',
        path: '/th-my-profile',
        options: Controller.thMyProfile,
      },
      {
        method: 'GET',
        path: '/th-territories',
        options: Controller.thTerritories,
      },
      {
        method: 'GET',
        path: '/th-territory-types',
        options: Controller.thTerritoryTypes,
      },
      {
        method: 'GET',
        path: '/th-locations/{territoryId}',
        options: Controller.thLocations,
      },
      {
        method: 'POST',
        path: '/th-locations',
        options: Controller.thLocationCreate,
      },
      {
        method: 'PUT',
        path: '/th-locations/{locationId}',
        options: Controller.thLocationUpdate,
      },
      {
        method: 'DELETE',
        path: '/th-locations/{locationId}',
        options: Controller.thLocationDelete
      },
      {
        method: 'GET',
        path: '/th-location-languages',
        options: Controller.thLocationLanguages,
      },
      {
        method: 'GET',
        path: '/th-location-statuses',
        options: Controller.thLocationStatuses,
      },
      {
        method: 'GET',
        path: '/th-location-types',
        options: Controller.thLocationTypes,
      },
      {
        method: 'GET',
        path: '/th-languages',
        options: Controller.thLanguages,
      },
    ]);
  },
  version: require('../../package.json').version,
  name: 'territory-helper-route',
};
