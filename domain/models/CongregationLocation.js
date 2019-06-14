const { Model } = require('objection');
const CongregationLocationActivity = require('./CongregationLocationActivity');
const OPERATIONS = require('./enums/activityOperations');

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
      required: [
        'congregationId',
        'locationId',
        'isPendingTerritoryMapping',
        'isDeleted',
        'isActive',
        'source',
      ],
      properties: {
        congregationId: { type: 'integer' },
        locationId: { type: ['integer', 'string'] }, // bigint
        territoryId: { type: ['integer', 'null'] },
        language: { type: 'string', maxLength: 64 },
        source: { type: 'string', maxLength: 64 },
        sourceData: { type: ['string', 'null'] }, // TODO get rid of this; it's a crutch
        sourceAccount: { type: ['string', 'null']},
        sourceLocationId: { type: ['string', 'null'], maxLength: 64 },
        isPendingTerritoryMapping: { type: 'boolean' }, // TODO get rid of this
        isDeleted: { type: 'boolean' }, // TODO get rid of this
        isActive: { type: 'boolean' }, // TODO get rid of this until it does something
        notes: { type: 'string' },
        userDefined1: { type: ['string', 'null'] }, // TODO get rid of this? until it is supported?
        userDefined2: { type: ['string', 'null'] }, // TODO get rid of this? until it is supported?
        attributes: { items: { type: 'string' } }, // TODO make this required
      },
    };
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

  static async detachCongregationLocation({ congregationId, locationId, source, trx }) {
    await CongregationLocation.query(trx).where({ congregationId, locationId, source }).patch({ isDeleted: true });
    await CongregationLocationActivity.addActivity({ congregation_id: congregationId, location_id: locationId, operation: OPERATIONS.DELETE, source, trx });
    console.log(`Deleted "congregationLocation": ${JSON.stringify({ congregationId, locationId, source })}`);
  }

  static async detachCongregationLocationBySource({ congregationId, locationId, sourceLocationId, source, trx }) {
    await CongregationLocation.query(trx).where({ congregationId, locationId, sourceLocationId, source }).patch({ isDeleted: true });
    await CongregationLocationActivity.addActivity({ congregation_id: congregationId, location_id: locationId, operation: OPERATIONS.DELETE, source, trx });
    console.log(`Deleted "congregationLocation": ${JSON.stringify({ congregationId, locationId, sourceLocationId, source })}`);
  }
}

module.exports = CongregationLocation;
