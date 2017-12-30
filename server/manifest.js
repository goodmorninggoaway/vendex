exports.manifest = {
  server: {
    router: {
      stripTrailingSlash: true,
      isCaseSensitive: false
    },
    routes: {
      security: {
        hsts: false,
        xss: true,
        noOpen: true,
        noSniff: true,
        xframe: false
      },
      cors: true,
      jsonp: 'callback', // <3 Hapi,
      auth: false
    },
    debug: !!process.env.DEBUG || false,
    port: +process.env.PORT || 1338,
  },
  register: {
    plugins: [
      {
        plugin: './app/routes/ui',
        routes: {
          prefix: '/ui',
        },
      },
      {
        plugin: './app/routes/alba',
        routes: {
          prefix: '/alba',
        },
      },
      {
        plugin: './app/routes/territory-helper',
        routes: {
          prefix: '/territoryhelper',
        },
      },
    ],
  },
};

exports.options = {
  // somehow vision only works if you register your vision plugin at this point
  // otherwise it gives you an error => Cannot render view without a views manager configured
  // Not a perfect solution but it works OK
  preRegister: async (server) => {
    await server.register(require('vision'));
    server.views({
      engines: {
        ejs: require('ejs'),
      },
      relativeTo: __dirname,
      path: '../../views',
      defaultExtension: 'ejs',
      layout: true,
      isCached: false,
      layoutKeyword: 'body',
      context: {
        moment: require('moment'),
        env: process.env.APP_ENV || 'PROD',
        version: require('../package.json').version,
      },
    });
  }
};
