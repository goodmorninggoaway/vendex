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
      },
    };
  }

  static get relationMappings() {
    const CongregationLocation = require('./CongregationLocation');

    return {
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

  static async getCongregation(id) {
    return await Congregation.query().findById(id);
  }
}

module.exports = Congregation;
