const { Model } = require('objection');

class CongregationLocation extends Model {
  static get tableName() {
    return 'congregationLocation';
  }

  static get idColumn() {
    return ['congregationId', 'locationId'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['congregationId', 'locationId', 'isPendingTerritoryMapping', 'isDeleted', 'isActive', 'source'],
      properties: {
        congregationId: { type: 'integer' },
        locationId: { type: 'integer' },
        territoryId: { type: 'integer' },
        sourceCongregationId: { type: 'integer' },
        language: { type: 'string', maxLength: 64 },
        source: { type: 'string', maxLength: 64 },
        sourceData: { type: 'string', maxLength: 64 }, // TODO get rid of this; it's a crutch
        sourceLocationId: { type: 'string', maxLength: 64 },
        isPendingTerritoryMapping: { type: 'boolean' }, // TODO get rid of this
        isDeleted: { type: 'boolean' }, // TODO get rid of this
        isActive: { type: 'boolean' }, // TODO get rid of this until it does something
        notes: { type: 'string' },
        userDefined1: { type: 'string' },// TODO get rid of this? until it is supported?
        userDefined2: { type: 'string' },// TODO get rid of this? until it is supported?
        attributes: { type: 'array', items: { type: 'string' } } // TODO make this required
      }
    }
  }

  static get relationMappings() {
    return {
      location: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./Location'),
        join: {
          from: 'congregationLocation.locationId',
          to: 'location.locationId',
        },
      },
    };
  }
}

module.exports = CongregationLocation;
