exports.plugin = {
  async register(server, options) {
    server.route([
      {
        method: 'GET',
        path: '/',
        options: {
          async handler(req, h) {
            return h.redirect('/ui');
          },
          auth: false,
        },
      },
    ]);
  },
  version: require('../../package.json').version,
  name: 'root-route',
};
