const { Model, snakeCaseMappers, transaction } = require('objection');
const AlbaLocationImportLocation = require('./AlbaLocationImportLocation');

class AlbaLocationImport extends Model {
  static get tableName() {
    return 'alba_location_import';
  }

  static get idColumn() {
    return 'id';
  }

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['payload', 'rowCount', 'congregationId', 'version', 'userId'],
      properties: {
        payload: { type: 'array', items: 'object' },
        rowCount: { type: 'integer', min: 0, max: 8192 },
        createTimestamp: { type: 'date-time' },
        congregationId: { type: 'integer' },
        version: { type: 'integer' },
        userId: { type: 'integer' },
        pendingLocationDeletions: { type: 'array', items: 'integer' },
        congregationIntegrationAnalysis: { type: 'object' },
      },
    };
  }

  static get relationMappings() {
    return {
      locations: {
        relation: Model.HasManyRelation,
        modelClass: AlbaLocationImportLocation,
        join: {
          from: 'alba_location_import.id',
          to: 'alba_location_import_by_location.alba_location_import_id',
        },
      },
    };
  }

  static async createSession({ congregationId, userId, payload }) {
    return await transaction(AlbaLocationImport.knex(), async (trx) => {
      await AlbaLocationImport.query(trx).where({ congregation_id: congregationId }).delete();
      let session = await AlbaLocationImport.query(trx).insert({ userId, congregationId, payload, rowCount: payload.length, version: 1 });

      await AlbaLocationImportLocation.query(trx).insert(payload.map(location => ({
        albaLocationImportId: session.$id(),
        albaId: location.Address_ID,
        payload: location,
      })));

      return await AlbaLocationImport.getSessionById(session.$id(), trx);
    });
  }

  static async getSessionById(id, trx) {
    return AlbaLocationImport.query(trx).eager('locations').findById(id);
  }

  static async getActiveSession(congregationId) {
    return await AlbaLocationImport.query().eager('locations').findOne({ congregation_id: congregationId });
  }

  async runPreLocationImportAnalysis() {
    const Congregation = require('./Congregation');

    const congregation = await Congregation.getCongregation(this.congregationId);

    // Map out the current integrations
    const agreementMap = {};
    if (congregation.integrationSources && congregation.integrationSources.length) {
      congregation.integrationSources.reduce((memo, source) => {
        memo[source.sourceCongregation.name] = memo[source.sourceCongregation.name] || {};
        memo[source.sourceCongregation.name][source.language === 'Any' ? '*' : source.language] = true;
        return memo;
      }, agreementMap);
    }

    // Map out the session's dataset
    const sessionMap = this.payload.reduce((memo, element) => {
      const { Account: recordCongregation, Language: recordLanguage } = element;
      memo[recordCongregation] = memo[recordCongregation] || {};
      memo[recordCongregation][recordLanguage] = memo[recordCongregation][recordLanguage] || 0;
      memo[recordCongregation][recordLanguage] += 1;
      return memo;
    }, {});

    return await AlbaLocationImport.query().patchAndFetchById(this.$id(), {
      congregationIntegrationAnalysis: {
        existing: agreementMap,
        requested: sessionMap,
      },
    });
  }
}

module.exports = AlbaLocationImport;
