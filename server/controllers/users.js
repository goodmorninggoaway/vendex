const Boom = require('boom');

module.exports = {
  // TODO Filter based on user auth
  listUsers: {
    async handler(req) {
      try {
        const { User } = req.server.models();
        return User.query().select('*');
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },
};
