exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/users');
    const Models = require('../../domain/models');

    server.register([
      { plugin: require('schwifty'), options: { models: [Models.User] } },
    ]);

    server.route([{ method: 'GET', path: '/', options: Controller.listUsers }]);
  },
  version: require('../../package.json').version,
  name: 'users-route',
};
