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
        congregationIntegrationAnalysis: { type: 'array' },
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
        await CongregationLocation.detachCongregationLocation({ locationId, congregationId, source, trx });
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

  async analyzeIntegrations() {
    return AlbaLocationImport.knex().raw(`
select 
	account, 
	case "language" when '' then 'Unknown' else "language" end as "language", 
	case max(enabled) when 1 then true else false end as enabled, 
	sum(matches) as "matchCount" 
from (
	-- Requested, by Language
	select 
	  j."Account" as account, 
	  j."Language" as "language", 
	  0 as enabled, 
	  1 as matches
	from alba_location_import_by_location l
	cross join lateral jsonb_to_record(l.payload) as j("Account" varchar(256), "Language"  varchar(256) )
	where l.alba_location_import_id = ?
	
	union all 
	
	-- Requested, by Account
	select j."Account" as account, '*' as "language", 0 as enabled, count(*) as matches
	from alba_location_import_by_location l
	cross join lateral jsonb_to_record(l.payload) as j("Account" varchar(256))
	where l.alba_location_import_id = ?
	group by j."Account"
	
	union all

	-- Existing
	select account, "language", 1 as enabled, 0 as matches
	from alba_integration
	where congregation_id = ? and "source" = ?
) dt1
group by account, "language"
order by 1, 2 
    `, [this.$id(), this.$id(), this.congregationId, this.source]);
  }

  async preImportActions() {
    return await AlbaLocationImport.query().patchAndFetchById(this.$id(), {
      congregationIntegrationAnalysis: (await this.analyzeIntegrations()).rows,
    });
  }
}

module.exports = AlbaLocationImport;
