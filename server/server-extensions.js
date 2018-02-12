exports.plugin = {
  async register(server, options) {
    server.ext({
      type: 'onPreResponse',
      async method(req, h) {
        const { credentials } = req.auth;
        console.log(credentials);
      },
    });
  },
  name: 'server-extensions',
  version: require('../package').version,
};
