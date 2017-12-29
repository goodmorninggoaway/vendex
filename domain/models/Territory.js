const { Model } = require('objection');

class Territory extends Model {
  static get tableName() {
    return 'territory';
  }

  static get idColumn() {
    return 'territoryId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['congregationId', 'boundary', 'deleted'],
      properties: {
        territoryId: { type: 'integer' },
        congregationId: { type: 'integer' },
        name: { type: 'string', minLength: 3, maxLength: 255 },
        boundary: { type: 'string' }, // actually a Postgres polygon
        userDefined1: {}, // TODO remove
        userDefined2: {}, // TODO remove
        externalTerritoryId: { type: 'string', maxLength: 256 },
        externalTerritorySource: { type: 'string', maxLength: 32 },
        deleted: { type: 'boolean' },
      },
    };
  }
}

module.exports = Territory;
