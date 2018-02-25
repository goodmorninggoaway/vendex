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
      {
        method: 'POST',
        path: '/invitations/accept',
        options: Controller.createUserFromInvitation,
      },
      { method: 'POST', path: '/login', options: Controller.login },
      { method: 'POST', path: '/logout', options: Controller.logout },
      { method: 'GET', path: '/logout', options: Controller.logout },
      {
        method: 'PUT',
        path: '/password',
        options: Controller.setPassword,
      },
      {
        method: 'POST',
        path: '/password-reset-requests',
        options: Controller.createPasswordResetRequest,
      },
      {
        method: 'PUT',
        path: '/password-reset-requests/{authenticationCode}',
        options: Controller.finishPasswordResetRequest,
      },
    ]);
  },
  version: require('../../package.json').version,
  name: 'auth-route',
};
