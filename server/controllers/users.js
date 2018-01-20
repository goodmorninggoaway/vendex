const Boom = require('boom');

module.exports = {
  listUsers: {
    async handler(req) {
      try {
        const { User } = req.server.models();
        const users = await User.query().select('*');
        return res.view('users/list', { users });
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },
};
