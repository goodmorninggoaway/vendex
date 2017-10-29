const { Model } = require('objection');

class Language extends Model {
  static get tableName() {
    return 'language';
  }

  static get idColumn() {
    return 'languageId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['language', 'synonyms'],
      properties: {
        languageId: { type: 'integer' },
        language: { type: 'string', maxLength: 64 },
        synonyms: { type: 'array', items: { type: 'string' }, minLength: 1 },
      },
    };
  }
}

module.exports = Language;
