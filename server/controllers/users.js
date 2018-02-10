const Boom = require('boom');
const { pick } = require('lodash');

module.exports = {
  // TODO Filter based on user auth
  // TODO Filter privileged fields using a hapi lifecycle hook
  listUsers: {
    async handler(req) {
      try {
        const { User } = req.server.models();
        const users = await User.query().select('*');

        return users.map(x => x.omitInternalFields());
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },

  editUser: {
    async handler(req) {
      try {
        const { User } = req.server.models();
        const { userId } = req.params;
        const user = pick(req.payload, 'email', 'name');

        const updated = await User.query()
          .skipUndefined()
          .where({ userId })
          .patch(user)
          .first()
          .returning('*');

        return updated.omitInternalFields();
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },
};
