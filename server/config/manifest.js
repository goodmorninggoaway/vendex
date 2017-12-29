const Config = require('config').util.toObject();
const Nunjucks = require('nunjucks');
const plugins = [
  // {
  //     plugin: require('yar'),
  //     options: Config.cookie
  // },
  // {
  //     plugin: require('crumb'),
  //     options: Config.crumb
  // },
  // {
  //     plugin: './lib/mongoose',
  //     options: {
  //         uri: Config.mongo
  //     }
  // },
  // {
  //     plugin: './lib/auth' // if you need authentication then uncomment this plugin
  // },
  {
    plugin: './app/routes/ui',
    routes: {
      prefix: '/ui'
    }
  },
  // {
  //     plugin: './app/routes/user',
  //     routes: {
  //         prefix: '/user'
  //     }
  // }
];
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
    debug: Config.debug,
    port: Config.port,
    // cache: [
    //     {...Config.redisCache, engine: require('catbox-redis'),}
    // ]
  },
  register: {
    plugins
  }
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
        njk: {
          compile: (src, options) => {
            const template = Nunjucks.compile(src, options.environment);
            return (context) => {
              return template.render(context);
            };
          },
          prepare: (options, next) => {
            options.compileOptions.environment = Nunjucks.configure(options.path, { watch: false });
            return next();
          }
        }
      },
      relativeTo: __dirname,
      path: [
        '../templates',
        '../../views',
      ],
      defaultExtension: 'ejs',
      layout: true,
      isCached: false,
      layoutKeyword: 'body',
      context: {
        moment: require('moment'),
        env: process.env.APP_ENV || 'PROD',
        version: require('../../package.json').version,
      },
    });
  }

};
