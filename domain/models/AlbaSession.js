const { Model, snakeCaseMappers, transaction } = require('objection');

class AlbaSession extends Model {
  static get tableName() {
    return 'alba_session';
  }

  static get idColumn() {
    return 'alba_session_id';
  }

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['payload', 'rowCount', 'congregationId', 'version'],
      properties: {
        payload: { type: 'array', items: 'object' },
        rowCount: { type: 'integer', min: 0, max: 8192 },
        createTimestamp: { type: 'date-time' },
        congregationId: { type: 'integer' },
        version: { type: 'integer' },
        userId: { type: 'integer' },
      },
    };
  }

  static async createSession({ congregationId, userId, payload }) {
    return await transaction(AlbaSession.knex(), async (trx) => {
      await AlbaSession.query(trx).where({ congregation_id: congregationId }).delete();
      const session = await AlbaSession.query(trx).insert({ userId, congregationId, payload, rowCount: payload.length, version: 1 });
      return session;
    });
  }
}

module.exports = AlbaSession;
