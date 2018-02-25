exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/users');

    server.register([{ plugin: require('schwifty') }]);

    server.route([
      { method: 'GET', path: '/', options: Controller.listUsers },
      { method: 'PUT', path: '/{userId}', options: Controller.editUser },
      { method: 'DELETE', path: '/{userId}', options: Controller.deactivateUser },
    ]);
  },
  version: require('../../package.json').version,
  name: 'users-route',
};
