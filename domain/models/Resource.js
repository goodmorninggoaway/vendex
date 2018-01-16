const { Model } = require('objection');

class Resource extends Model {
  static get tableName() {
    return 'resource';
  }

  static get idColumn() {
    return 'resourceId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        resourceId: { type: 'string', minLength: 3, maxLength: 32 },
      },
    };
  }
}

module.exports = Resource;
