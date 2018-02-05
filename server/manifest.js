const plugins = [
  { plugin: 'hapi-auth-jwt2' },
  {
    plugin: 'schwifty',
    options: {
      knex: require('../domain/dataAccess').knex,
      models: Object.values(require('../domain/models')),
    },
  },
  {
    plugin: 'inert',
  },
  {
    plugin: './routes/users',
    routes: {
      prefix: '/users',
    },
  },
  {
    plugin: './routes/auth',
    routes: {
      prefix: '/auth',
    },
  },
  {
    plugin: './routes/root',
  },
  {
    plugin: './routes/ui',
    routes: {
      prefix: '/ui',
    },
  },
  {
    plugin: './routes/alba',
    routes: {
      prefix: '/alba',
    },
  },
  {
    plugin: './routes/territory-helper',
    routes: {
      prefix: '/territoryhelper',
    },
  },
  {
    plugin: './routes/static-assets',
    routes: {
      prefix: '/assets',
    },
  },
];

if (process.env.APP_ENV === 'DEV') {
  plugins.push({
    plugin: 'good',
    options: {
      ops: {
        interval: 1000,
      },
      reporters: {
        console: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*', error: '*' }],
          },
          { module: 'good-console' },
          'stdout',
        ],
      },
    },
  });
}

exports.manifest = {
  server: {
    router: {
      stripTrailingSlash: true,
      isCaseSensitive: false,
    },
    routes: {
      security: {
        hsts: false,
        xss: true,
        noOpen: true,
        noSniff: true,
        xframe: false,
      },
      cors: true,
      jsonp: 'callback', // <3 Hapi,
      auth: false,
    },
    debug: !!process.env.DEBUG || false,
    port: +process.env.PORT || 1338,
  },
  register: {
    plugins,
  },
};

exports.options = {
  // somehow vision only works if you register your vision plugin at this point
  // otherwise it gives you an error => Cannot render view without a views manager configured
  // Not a perfect solution but it works OK
  preRegister: async server => {
    await server.register(require('vision'));
    server.views({
      engines: {
        ejs: require('ejs'),
      },
      relativeTo: __dirname,
      path: '../views',
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
  },
};
