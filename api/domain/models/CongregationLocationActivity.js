const { Model } = require('objection');

class CongregationLocationActivity extends Model {
  static get tableName() {
    return 'congregationLocationActivity';
  }

  static get idColumn() {
    return 'congregationLocationActivityId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['congregationId', 'locationId', 'operation', 'source'],
      properties: {
        congregationId: { type: 'integer' },
        locationId: { type: 'integer' },
        operation: { type: 'string', length: 1, enum: ['D', 'I', 'U'] },
        source: { type: 'string', minLength: 3, maxLength: 32 },
      },
    };
  }
}

module.exports = CongregationLocationActivity;
