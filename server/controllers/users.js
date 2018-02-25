const Boom = require('boom');
const { pick } = require('lodash');

module.exports = {
  // TODO Filter privileged fields using a hapi lifecycle hook
  listUsers: {
    async handler(req) {
      try {
        const { User } = req.server.models();
        const { congregationId } = req.auth.credentials;
        const users = await User.query()
          .skipUndefined()
          .where({ congregationId })
          .select('*');

        return users.map(x => x.omitInternalFields());
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },

  // TODO limit access by property based on auth
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

  deactivateUser: {
    async handler(req) {
      try {
        const { User } = req.server.models();
        const { userId } = req.params;
        const { congregationId } = req.auth.credentials;

        return User.query()
          .where({ congregationId, userId })
          .patch({ isActive: false })
          .returning('*');
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },
};
