const { Model } = require('objection');
const Bcrypt = require('bcrypt');
const Omit = require('lodash/omit');

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

  static async login(username, password, db) {
    let user = await User.query(db).findOne({ username, isActive: true });
    const isAuthenticated = user && user.verifyPassword(password);
    if (!isAuthenticated) {
      return null;
    }

    user.loginTimestamp = new Date();
    user = await User.query(db)
      .update(user)
      .where({ userId: user.$id() })
      .first()
      .returning('*');

    return user;
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

    return User.query(db)
      .patch(this)
      .where({ userId: this.$id() })
      .returning('*')
      .first();
  }

  omitInternalFields() {
    return Omit(this, 'password', 'salt', 'authenticationCode', 'authenticationCreationTimestamp');
  }
}

module.exports = User;
