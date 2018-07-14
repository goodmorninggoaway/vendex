const Boom = require('boom');
const { pick } = require('lodash');

module.exports = {
  // TODO Filter privileged fields using a hapi lifecycle hook
  listUsers: {
    async handler(req) {
      try {
        const { User } = req.server.models();
        const { congregationId, roles } = req.auth.credentials;
        const userQuery = User.query()
          .skipUndefined()
          .select('*');

        if (roles.indexOf('admin') == -1) {
          userQuery.where({ congregationId })
        }

        const users = await userQuery;
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
        const { congregationId, roles } = req.auth.credentials;
        const { User } = req.server.models();
        const { userId } = req.params;
        const user = pick(req.payload, 'email', 'name', 'roles', 'congregationId', 'isActive');

        if (user.congregationId != congregationId && roles.indexOf("admin") == -1) {
          Boom.forbidden("You can only modify users in your own congregation.");
        }

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
