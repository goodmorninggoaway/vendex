const Boom = require('boom');
const sortBy = require('lodash/sortBy');
const DAL = require('../../domain/dataAccess').DAL;

module.exports = {
  listUsers: {
    async handler(req, res) {
      try {
        const { User } = req.server.models();
        const users = await User.query().select('*');
        return res.view('users/list', { users });
      } catch (ex) {
        console.log(ex);
        return Boom.serverUnavailable();
      }
    },
  },
};
