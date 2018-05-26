const { Model, snakeCaseMappers } = require('objection');

class AlbaIntegration extends Model {
  static get tableName() {
    return 'alba_integration';
  }

  static get idColumn() {
    return 'alba_integration_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['account', 'source'],
      properties: {
        albaIntegrationId: { type: 'integer' },
        congregationId: { type: 'integer' },
        account: { type: 'string', minLength: 3, maxLength: 128 },
        language: { type: 'string', maxLength: 64 },
        source: { type: 'string', minLength: 3, maxLength: 64 },
      },
    };
  }

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static async hasIntegration({ congregationId, source, language, account }) {
    const integration = await AlbaIntegration.query()
      .where({ source, account, congregation_id: congregationId })
      .whereRaw(`language is null OR language = '*' OR language = ?`, [language])
      .first();

    return !!integration;
  }
}

module.exports = AlbaIntegration;
