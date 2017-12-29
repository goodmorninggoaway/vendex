const { Model } = require('objection');

class CongregationIntegration extends Model {
  static get tableName() {
    return 'congregationIntegration';
  }

  static get idColumn() {
    return 'congregationIntegrationId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['destinationCongregationId', 'sourceCongregationId'],
      properties: {
        congregationIntegrationId: { type: 'integer' },
        destinationCongregationId: { type: 'integer' },
        sourceCongregationId: { type: 'integer' },
        language: { type: 'string', minLength: 3, maxLength: 64 },
      }
    }
  }

  static get relationMappings() {
    const Congregation = require('./Congregation');
    const CongregationLocationActivity = require('./CongregationLocationActivity');

    return {
      sourceCongregation: {
        relation: Model.HasOneRelation,
        modelClass: Congregation,
        join: {
          from: 'congregationIntegration.sourceCongregationId',
          to: 'congregation.congregationId',
        },
      },

      destinationCongregation: {
        relation: Model.HasOneRelation,
        modelClass: Congregation,
        join: {
          from: 'congregationIntegration.destinationCongregationId',
          to: 'congregation.congregationId',
        },
      },

      sourceActivities: {
        relation: Model.HasManyRelation,
        modelClass: CongregationLocationActivity,
        join: {
          from: 'congregationIntegration.sourceCongregationId',
          to: 'congregationLocationActivity.congregationId',
        },
      },
    };
  }
}

module.exports = CongregationIntegration;
