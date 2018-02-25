const Boom = require('boom');
const HttpStatus = require('http-status-codes');
const Moment = require('moment');

const TOKEN_TTL = process.env.TOKEN_EXPIRATION_MINUTES || 24 * 60;
const PASSWORD_RESET_TOKEN_TTL =
  process.env.PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES || 60;

const COOKIE_PATH = '/';
const SECURE_COOKIE = process.env.USE_SSL !== 'false';
const cookieOptions = {
  path: COOKIE_PATH,
  isSecure: SECURE_COOKIE,
  ttl: TOKEN_TTL * 60 * 1000,
};

module.exports = {
  login: {
    auth: false,
    async handler(req, h) {
      try {
        const { User } = req.server.models();
        const { email: username, password } = req.payload;
        const user = await User.login(username, password);
        if (!user) {
          console.warn(`Failed login attempt for ${username}`, { ...req.info });
          return Boom.forbidden();
        }

        const token = User.generateJWT(
          user.userId,
          {
            congregationId: user.congregationId,
            roles: user.roles,
            email: user.email,
            name: user.name,
          },
          TOKEN_TTL,
        );

        console.info(`Login succeeded for ${username}`, { ...req.info });

        return h
          .response()
          .header('authorization', token)
          .state('token', token, cookieOptions)
          .redirect('/ui');
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },

  logout: {
    auth: false,
    async handler(req, h) {
      try {
        return h.redirect('/ui/login').unstate('token', cookieOptions);
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
        const { email, password } = req.payload;
        const { sub: userId } = req.auth.credentials;

        let user = await User.query().findOne({ email, userId });
        if (!user) {
          return Boom.forbidden();
        }

        user = await user.resetPassword(password);
        return h.response().code(HttpStatus.OK);
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },

  createPasswordResetRequest: {
    auth: false,
    async handler(req, h) {
      try {
        const { User } = req.server.models();
        const { email } = req.payload;

        let user = await User.query().findOne({ email });
        if (!user) {
          // Don't give an attacker info
          console.warn(`Invalid password reset requested for email ${email}`, {
            ...req.info,
          });
          return h.response().code(HttpStatus.OK);
        }

        user = await user.createPasswordResetRequest();
        console.info(`Password reset requested for email ${email}`, {
          ...req.info,
        });
        return h.response().code(HttpStatus.OK);
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },

  finishPasswordResetRequest: {
    auth: false,
    async handler(req, h) {
      try {
        const { User } = req.server.models();
        const { authenticationCode } = req.params;
        const { password, confirmPassword } = req.payload;

        if (password !== confirmPassword) {
          return Boom.badRequest('Passwords do not match');
        }

        let user = await User.query()
          .where({ authenticationCode })
          .andWhere(
            'authenticationCreationTimestamp',
            '>=',
            Moment()
              .subtract(PASSWORD_RESET_TOKEN_TTL, 'minutes')
              .toDate(),
          )
          .first();

        if (!user) {
          console.warn(`Failed attempt to reset password`, {
            ...req.info,
          });
          return Boom.badRequest('Invalid or expired code.');
        }

        user = await user.resetPassword(password);
        console.info(`Password reset User ${user.userId}`, {
          ...req.info,
        });
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
        const {
          email,
          name,
          congregationId: requestedCongregationId,
        } = req.payload;
        const { congregationId } = req.auth.credentials;

        return await Invitation.addInvitation({
          email,
          congregationId: requestedCongregationId || congregationId,
          name,
          roles: ['admin'],
        });
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },

  createUserFromInvitation: {
    auth: false,
    async handler(req, h) {
      try {
        const { Invitation } = req.server.models();
        const { email, code, name, password, confirmPassword } = req.payload;

        if (password !== confirmPassword) {
          return Boom.badRequest();
        }

        const valid = await Invitation.createUserFromInvitation({
          email,
          code,
          name,
          password,
        });

        if (!valid) {
          console.info(`Registration attempt failed for ${email}`, {
            ...req.info,
          });
          return Boom.badRequest();
        }

        console.info(`Registration attempt succeeded for ${email}`, {
          ...req.info,
        });
        return h.redirect('/ui/login');
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },
};
