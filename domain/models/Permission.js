const { Model } = require('objection');

class Permission extends Model {
  static get tableName() {
    return 'permission';
  }

  static get idColumn() {
    return 'permissionId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['subjectType', 'subjectId', 'resourceId', 'action'],
      properties: {
        permissionId: { type: 'integer' },
        subjectType: { type: 'string' },
        subjectId: { type: 'string' },
        resourceId: { type: 'string' },
        action: { type: 'string' },
        targetType: { type: 'string' },
        targetId: { type: 'string' },
      },
    };
  }
}

module.exports = Permission;
