const { Model } = require('objection');
const Bcrypt = require('bcrypt');
const Omit = require('lodash/omit');
const Notification = require('../notifications');
const Jwt = require('jsonwebtoken');
const Moment = require('moment');
const { version } = require('../../package');

class User extends Model {
  static get tableName() {
    return 'user';
  }

  static get idColumn() {
    return 'userId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['username'],
      properties: {
        userId: { type: 'integer' },
        isActive: { type: 'boolean' },
        username: { type: 'string', minLength: 3, maxLength: 64 },
        password: { type: 'string', minLength: 3, maxLength: 128 },
        name: { type: 'string', minLength: 3, maxLength: 128 },
        salt: { type: 'string', minLength: 3, maxLength: 128 },
        createTimestamp: { type: 'date-time' },
        loginTimestamp: { type: 'date-time' },
        passwordResetTimestamp: { type: 'date-time' },
        congregationId: { type: 'integer' },
        roles: { type: 'array', items: { type: 'string' } },
        authenticationCode: { type: 'string', maxLength: 64 },
        authenticationCreationTimestamp: { type: 'date-time' },
      },
    };
  }

  static async generateSaltAndHash(plainPassword) {
    const salt = await Bcrypt.genSalt();
    const hash = await Bcrypt.hash(plainPassword, salt);

    return { salt, hash };
  }

  static async login(email, password, db) {
    let user = await User.query(db).findOne({ email, isActive: true });
    const isAuthenticated = user && (await user.verifyPassword(password));
    if (!isAuthenticated) {
      return null;
    }

    user.loginTimestamp = new Date();
    user.authenticationCode = null;
    user.authenticationCreationTimestamp = null;

    user = await User.query(db)
      .update(user)
      .where({ userId: user.$id() })
      .first()
      .returning('*');

    return user;
  }

  static async thLogin(email, db) {
    let user = await User.query(db).findOne({ email, isActive: true });
    if (!user) {
      return null;
    }

    user.loginTimestamp = new Date();
    user.authenticationCode = null;
    user.authenticationCreationTimestamp = null;

    user = await User.query(db)
      .update(user)
      .where({ userId: user.$id() })
      .first()
      .returning('*');

    return user;
  }

  static async generateJWT(userId, claims, ttl) {
    return await Jwt.sign(
      {
        version,
        iss: 'vendex',
        sub: userId,
        iat: new Moment().unix(),
        exp: new Moment().add(ttl, 'minutes').unix(),
        ...claims,
      },
      process.env.SECRET,
    );
  }

  async verifyPassword(plainPassword) {
    const { password } = this;
    return Bcrypt.compare(plainPassword, password);
  }

  async resetPassword(password, db) {
    const { salt, hash } = await User.generateSaltAndHash(password);

    this.salt = salt;
    this.password = hash;
    this.passwordResetTimestamp = new Date();
    this.isActive = true;
    this.authenticationCode = null;
    this.authenticationCreationTimestamp = null;

    return User.query(db)
      .patch(this)
      .where({ userId: this.$id() })
      .returning('*')
      .first();
  }

  async createPasswordResetRequest(db) {
    const user = await User.query(db)
      .patch({
        authenticationCode: await Bcrypt.genSalt(),
        authenticationCreationTimestamp: new Date(),
      })
      .where({ userId: this.$id() })
      .returning('*')
      .first();

    await new Notification(Notification.types.PASSWORD_RESET)
      .asEmail()
      .to(`${this.name} <${this.email}>`)
      .properties({
        name: this.name,
        resetLink: `${process.env.UI_BASE_URL}/reset-password?code=${
          user.authenticationCode
          }`,
      })
      .send();
  }

  omitInternalFields() {
    return Omit(
      this,
      'password',
      'salt',
      'authenticationCode',
      'authenticationCreationTimestamp',
    );
  }
}

module.exports = User;
