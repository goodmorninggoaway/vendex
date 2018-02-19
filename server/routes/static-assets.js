exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/static-assets');
    server.route([
      {
        method: 'GET',
        path: '/react/views/{path*}',
        options: Controller.react,
      },
      {
        method: 'GET',
        path: '/static/{path*}',
        options: Controller.serve,
      },
    ]);
  },
  version: require('../../package.json').version,
  name: 'static-assets-route',
};
