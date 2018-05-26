const { Model, snakeCaseMappers, transaction } = require('objection');
const { uniq, difference } = require('lodash');
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
        summary: { type: 'object' },
        source: { type: 'string' },
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

  static async createSession({ congregationId, userId, payload, source }) {
    return await transaction(AlbaLocationImport.knex(), async (trx) => {
      await AlbaLocationImport.query(trx).where({ source, congregation_id: congregationId }).delete();
      let session = await AlbaLocationImport.query(trx).insert({ source, userId, congregationId, payload, rowCount: payload.length, version: 1 });

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

  static async getActiveSession(congregationId, source) {
    return await AlbaLocationImport.query().eager('locations').findOne({ source, congregation_id: congregationId });
  }

  async postImportActions(source) {
    const Congregation = require('./Congregation');
    const CongregationLocation = require('./CongregationLocation');
    const CongregationLocationActivity = require('./CongregationLocationActivity');

    const congregation = await Congregation.query().findById(this.congregationId).eager('[congregationLocations]');
    const { congregationId } = congregation;
    const existingLocations = congregation.congregationLocations
      .filter(x => x.source === source)
      .map(x => x.locationId);

    const touchedLocations = this.locations.map(x => x.translatedLocation && x.translatedLocation.locationId);
    const pendingLocationDeletions = uniq(difference(existingLocations, touchedLocations));

    await transaction(AlbaLocationImport.knex(), async (trx) => {
      for (let i in pendingLocationDeletions) {
        const locationId = pendingLocationDeletions[i];
        await CongregationLocation.query(trx).delete().where({ locationId, congregationId, source });
        await CongregationLocationActivity.query(trx).insert({ congregationId, locationId, source, operation: 'D' });
        console.log(`Deleted "congregationLocation": locationId=${locationId}, congregationId=${congregationId}, source=${source}`);
      }
    });

    // Generate summary
    const summary = this.locations
      .filter(x => x.translatedLocation && x.translatedCongregationLocation && x.translatedCongregationLocation.isValid)
      .reduce((memo, { translatedLocation: { isNew } }) => {
        if (isNew) {
          memo.inserted++;
        } else {
          memo.updated++;
        }

        return memo;
      }, { inserted: 0, updated: 0, deleted: pendingLocationDeletions.length || 0 });

    return await AlbaLocationImport.query().patchAndFetchById(this.$id(), { pendingLocationDeletions, summary });
  }

  async preImportActions() {
    const AlbaIntegration = require('./AlbaIntegration');

    // Map out the current integrations
    const integrations = await AlbaIntegration.query().where({ source: this.source, congregation_id: this.congregationId });
    const integrationMap = integrations.reduce((memo, { language, account }) => {
      let resolvedLanguage;
      switch (language) {
      case null:
      case 'Any':
        resolvedLanguage = '*';
        break;
      default:
        resolvedLanguage = language;
        break;
      }

      memo[account] = memo[account] || {};
      memo[account][language] = true;
      return memo;
    }, {});

    // Map out the session's dataset
    const sessionMap = this.payload.reduce((memo, element) => {
      const { Account: account, Language: language } = element;
      memo[account] = memo[account] || {};
      memo[account][language] = memo[account][language] || 0;
      memo[account][language] += 1;
      return memo;
    }, {});

    return await AlbaLocationImport.query().patchAndFetchById(this.$id(), {
      congregationIntegrationAnalysis: {
        existing: integrationMap,
        requested: sessionMap,
      },
    });
  }
}

module.exports = AlbaLocationImport;
