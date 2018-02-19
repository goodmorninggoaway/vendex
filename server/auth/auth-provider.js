exports.plugin = {
  async register(server, options) {
    server.register(require('hapi-auth-jwt2'));

    if (!process.env.SECRET) {
      throw new Error('Missing process.env.SECRET');
    }

    server.auth.strategy('jwt', 'jwt', {
      key: process.env.SECRET,
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
