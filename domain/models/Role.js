const { Model } = require('objection');

class Role extends Model {
  static get tableName() {
    return 'role';
  }

  static get idColumn() {
    return 'roleId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        roleId: { type: 'string', minLength: 3, maxLength: 32 },
        name: { type: 'string', minLength: 3, maxLength: 64 },
      },
    };
  }
}

module.exports = Role;
