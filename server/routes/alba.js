exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/alba');
    server.route([
      { method: 'POST', path: '/locations', options: Controller.importLocations },
    ]);
  },
  version: require('../../package.json').version,
  name: 'alba-route'
};
