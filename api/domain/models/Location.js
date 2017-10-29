const { Model } = require('objection');

class Location extends Model {
  static get tableName() {
    return 'location';
  }

  static get idColumn() {
    return 'locationId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        locationId: { type: 'integer' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        number: { type: 'string', maxLength: 255 },
        sec_unit_type: { type: 'string', maxLength: 255 },
        sec_unit_num: { type: 'string', maxLength: 255 },
        street: { type: 'string', maxLength: 255 },
        city: { type: 'string', maxLength: 255 },
        zip: { type: 'string', maxLength: 255 },
        state: { type: 'string', maxLength: 255 },
        countryCode: { type: 'string', maxLength: 255 },
        externalLocationId: { type: 'string', maxLength: 512 },
        externalLocationLastRefreshedDateTime: { type: 'string', maxLength: 32 }, // TODO not used
        externalSource: { type: 'string', maxLength: 32 }, // TODO Redundant name
      }
    }
  }

  static get relationMappings() {
    return {
      congregationLocations: {
        relation: Model.HasManyRelation,
        modelClass: require('./CongregationLocation'),
        join: {
          from: 'location.locationId',
          to: 'congregationLocation.locationId',
        },
      },
    };
  }
}

module.exports = Location;
