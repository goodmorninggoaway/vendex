exports.plugin = {
  async register(server, options) {
    server.ext({
      type: 'onPreResponse',
      async method(req, h) {
        const res = req.response;
        if (res.isBoom) {
          if (res.output.statusCode === 401) {
            return h.redirect('/ui/login');
          }
          return h
            .view(
              'error',
              {
                errorTitle: res.output.payload.error,
                errorMessage: res.output.payload.message,
                statusCode: res.output.statusCode,
                email: '',
              },
              {
                layout: false,
              },
            )
            .code(402);
        }

        return h.continue;
      },
    });
  },
  name: 'server-extensions',
  version: require('../package').version,
};
