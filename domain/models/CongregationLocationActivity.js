const { Model, snakeCaseMappers, transaction } = require('objection');
const AlbaLocationImportLocation = require('./AlbaLocationImportLocation');

class CongregationLocationActivity extends Model {
  static get tableName() {
    return 'congregation_location_activity';
  }

  static get idColumn() {
    return 'congregation_location_activity_id';
  }

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['congregation_id', 'location_id', 'operation', 'source'],
      properties: {
        congregationId: { type: 'integer' },
        locationId: { type: ['integer', 'string'] }, // bigint
        operation: { type: 'string', length: 1, enum: ['D', 'I', 'U'] },
        source: { type: 'string', minLength: 3, maxLength: 32 },
      },
    };
  }

  static addAlbaActivity(albaLocationImportId, values) {
    return transaction(CongregationLocationActivity.knex(), async (trx) => {
      const activity = await CongregationLocationActivity.query(trx).insert(values);

      if (albaLocationImportId) {
        await AlbaLocationImportLocation.query(trx)
          .where({ alba_location_import_id: albaLocationImportId })
          .patch({ operation: { value: values.operation } });
      }

      return activity;
    });
  }

  static addActivity(values) {
    return CongregationLocationActivity.query().insert(values);
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = CongregationLocationActivity;
