exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/auth');

    server.register([
      {
        plugin: require('schwifty'),
      },
    ]);

    server.route([
      {
        method: 'POST',
        path: '/invitations',
        options: Controller.inviteNewUser,
      },
      {
        method: 'PUT',
        path: '/invitations',
        options: Controller.createUserFromInvitation,
      },
      { method: 'POST', path: '/login', options: Controller.login },
      {
        method: 'PUT',
        path: '/password',
        options: Controller.setPassword,
      },
    ]);
  },
  version: require('../../package.json').version,
  name: 'auth-route',
};
