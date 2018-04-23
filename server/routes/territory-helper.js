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
        method: 'POST',
        path: '/territories',
        options: Controller.importTerritories,
      },
    ]);
  },
  version: require('../../package.json').version,
  name: 'territory-helper-route',
};
