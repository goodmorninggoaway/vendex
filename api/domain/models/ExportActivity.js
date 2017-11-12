const { Model } = require('objection');

class ExportActivity extends Model {
  static get tableName() {
    return 'exportActivity';
  }

  static get idColumn() {
    return 'exportActivityId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['congregationId', 'lastCongregationLocationActivityId'],
      properties: {
        exportActivityId: { type: 'integer' },
        congregationId: { type: 'integer' },
        lastCongregationLocationActivityId: { type: 'integer' },
        timestamp: { required: true },
        source: { type: 'string', minLength: 3, maxLength: 32 }, // TODO remove this
        destination: { type: 'string', minLength: 3, maxLength: 32 },
      },
    };
  }
}

module.exports = ExportActivity;
