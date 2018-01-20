const { Model } = require('objection');

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
        salt: { type: 'string', minLength: 3, maxLength: 128 },
        createTimestamp: { type: 'date-time' },
        loginTimestamp: { type: 'date-time' },
        passwordResetTimestamp: { type: 'date-time' },
        congregationId: { type: 'string', minLength: 3, maxLength: 64 },
        roles: { type: 'array', items: { type: 'string' } },
      },
    };
  }
}

module.exports = User;
