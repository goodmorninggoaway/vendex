exports.plugin = {
  async register(server, options) {
    server.ext({
      type: 'onPreResponse',
      async method(req, h) {
        const res = req.response;
        if (res.isBoom) {
          if (req.path.match(/^\/ui/) && res.output.statusCode === 401) {
            return h.redirect('/ui/login');
          }
        }
        return h.continue;
      },
    });
  },
  name: 'server-extensions',
  version: require('../package').version,
};
