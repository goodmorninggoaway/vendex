exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/ui');
    server.route([
      { method: 'GET', path: '/', options: Controller.homepage },
    ]);
  },
  version: require('../../package.json').version,
  name: 'root-route'
};
