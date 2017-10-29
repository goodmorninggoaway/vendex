const { Model } = require('objection');

class GeocodeResponse extends Model {
  static get tableName() {
    return 'geocodeResponse';
  }

  static get idColumn() {
    return 'geocodeResponseId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['source'],
      properties: {
        address: { type: 'string' },
        response: { type: 'object' },
        source: { type: 'string', maxLength: 32 },
      },
    };
  }
}

module.exports = GeocodeResponse;
