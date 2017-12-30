exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/territory-helper');
    server.route([
      { method: 'POST', path: '/locations', options: Controller.importLocations },
      { method: 'GET', path: '/locations', options: Controller.exportLocations },
      { method: 'POST', path: '/territories', options: Controller.importTerritories },
    ]);
  },
  version: require('../../package.json').version,
  name: 'territory-helper-route'
};
