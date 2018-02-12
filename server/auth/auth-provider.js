exports.plugin = {
  async register(server, options, next) {
    server.register(require('hapi-auth-jwt2'));

    server.auth.strategy('jwt', 'jwt', {
      key: process.env.SECRET || 'NeverShareYourSecret',
      async validate(decoded, req) {
        return { isValid: true };
      },
      verifyOptions: { algorithms: ['HS256'] },
    });

    server.auth.default('jwt');
  },
  name: 'auth-provider',
  version: require('../../package').version,
};
