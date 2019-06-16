const axios = require('axios');
const Boom = require('boom');
const HttpStatus = require('http-status-codes');
const Moment = require('moment');

const TOKEN_TTL = process.env.TOKEN_EXPIRATION_MINUTES || 24 * 60;
const PASSWORD_RESET_TOKEN_TTL =
  process.env.PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES || 60;

const COOKIE_PATH = '/';
const SECURE_COOKIE = process.env.USE_SSL !== 'false';
const tokenCookieOptions = {
  path: COOKIE_PATH,
  isSameSite: 'Lax',
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
          .state('token', token, tokenCookieOptions)
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
        return h.redirect('/ui/login').unstate('token', tokenCookieOptions);
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },

  thAuthorize: {
    handler: async function (req, res) {
      const { code } = req.query;
      if (code) {
        const { TH_URL, TH_CLIENT_ID, TH_CLIENT_SECRET } = process.env;
        const thTokenUrl = `${TH_URL}/api/token?grant_type=authorization_code&code=${code}&client_id=${TH_CLIENT_ID}&client_secret=${TH_CLIENT_SECRET}&redirect_uri=` + encodeURIComponent(`${req.server.info.protocol}://${req.info.host}/auth/th/authorize`);
        const tokenResponse = await axios.post(thTokenUrl);
        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        const userDetails = await axios.get(`${TH_URL}/api/publishers/me?access_token=${access_token}`);

        const COOKIE_PATH = '/';
        const SECURE_COOKIE = process.env.USE_SSL !== 'false';
        const thCookieOptions = {
          path: COOKIE_PATH,
          isSameSite: 'Lax',
          isSecure: SECURE_COOKIE,
        };

        const { User } = req.server.models();
        const { Email } = userDetails.data;
        const user = await User.thLogin(Email);
        if (!user) {
          console.warn(`${Email} is not setup in an account. Please contact your congregation administrator.`, { ...req.info });
          return res.redirect('/ui/login?loginError=' + encodeURIComponent(`${Email} is not setup in an account. Please contact your congregation administrator.`));
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

        console.info(`Login succeeded for ${Email}`, { ...req.info });

        return res
          .redirect('/ui')
          .header('authorization', token)
          .state('token', token, tokenCookieOptions)
          .state('th_access_token', access_token, { ...thCookieOptions, ttl: (expires_in * 1000) })
          .state('th_refresh_token', refresh_token, thCookieOptions);
      }
    },
    auth: false,
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
          roles: requestedRoles,
        } = req.payload;
        const { congregationId, roles, name: invitingUserName } = req.auth.credentials;
        const isAdmin = roles.indexOf('admin') != -1;
        if (!isAdmin && (requestedCongregationId != congregationId || requestedRoles.indexOf('admin') != -1)) {
          return Boom.forbidden("Only administrators are allowed to create other administrators and users in different congregations.");
        }

        return await Invitation.addInvitation({
          email,
          congregationId: requestedCongregationId || congregationId,
          name,
          roles: requestedRoles,
          invitingUserName,
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

  listInvitations: {
    async handler(req) {
      try {
        const { Invitation } = req.server.models();
        const { congregationId, roles } = req.auth.credentials;

        const invitationQuery = Invitation.query()
          .eager('[congregation]')
          .select('*');

        if (roles.indexOf("admin") == -1) {
          invitationQuery.where({ congregationId });
        }

        return invitationQuery;
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },

  deleteInvitation: {
    async handler(req) {
      try {
        const { Invitation } = req.server.models();
        const { invitationId } = req.params;
        const { congregationId } = req.auth.credentials;

        return Invitation.query()
          .where({ congregationId, invitationId })
          .delete();
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },
};
