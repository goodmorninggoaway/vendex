const { Model } = require('objection');

class Congregation extends Model {
  static get tableName() {
    return 'congregation';
  }

  static get idColumn() {
    return 'congregationId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'language'],
      properties: {
        congregationId: { type: 'integer' },
        name: { type: 'string', minLength: 3, maxLength: 255 },
        language: { type: 'string', minLength: 3, maxLength: 64 },
      }
    }
  }

  static get relationMappings() {
    const CongregationIntegration = require('./CongregationIntegration');
    const CongregationLocation = require('./CongregationLocation');

    return {
      integrationSources: {
        relation: Model.HasManyRelation,
        modelClass: CongregationIntegration,
        join: {
          from: 'congregation.congregationId',
          to: 'congregationIntegration.destinationCongregationId',
        },
      },

      integrationDestinations: {
        relation: Model.HasManyRelation,
        modelClass: CongregationIntegration,
        join: {
          from: 'congregation.congregationId',
          to: 'congregationIntegration.sourceCongregationId',
        },
      },

      congregationLocations: {
        relation: Model.HasManyRelation,
        modelClass: CongregationLocation,
        join: {
          from: 'congregation.congregationId',
          to: 'congregationLocation.congregationId',
        },
      },
    };
  }
}

module.exports = Congregation;
