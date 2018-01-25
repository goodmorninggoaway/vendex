const Boom = require('boom');
const HttpStatus = require('http-status-codes');
const Jwt = require('jsonwebtoken');
const Moment = require('moment');

const TOKEN_TTL = process.env.TOKEN_EXPIRATION_MINUTES || 24 * 60;

module.exports = {
  login: {
    async handler(req, h) {
      try {
        const { User } = req.server.models();
        const { username, password } = req.payload;
        const user = await User.login(username, password);
        if (!user) {
          return Boom.unauthorized();
        }

        const token = Jwt.sign(
          {
            iss: 'vendex',
            sub: user.userId,
            iat: new Moment().unix(),
            exp: new Moment().add(TOKEN_TTL, 'minutes').unix(),
            congregationId: user.congregationId,
            roles: user.roles,
            email: user.email,
          },
          process.env.SECRET,
        );

        return h
          .response()
          .header('authorization', token)
          .state('token', token, {
            ttl: TOKEN_TTL * 60 * 1000,
          });
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },

  setPassword: {
    async handler(req, h) {
      try {
        const { User } = req.server.models();
        const { username, password } = req.payload;

        let user = await User.query().findOne({ username });
        if (!user) {
          return Boom.unauthorized();
        }

        user = await user.resetPassword(password);
        return h.response().code(HttpStatus.OK);
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },

  inviteNewUser: {
    async handler(req) {
      try {
        const { Invitation } = req.server.models();
        const { email, congregationId } = req.payload;
        return Invitation.addInvitation({
          email,
          congregationId: +congregationId,
          roles: ['admin'],
        });
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },

  createUserFromInvitation: {
    async handler(req) {
      try {
        const { Invitation } = req.server.models();
        const { email, congregationId, code, name, password } = req.payload;

        return Invitation.createUserFromInvitation({
          email,
          congregationId,
          code,
          name,
          password,
        });
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },
};
