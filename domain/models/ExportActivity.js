const { Model } = require('objection');
const OPERATIONS = require('./enums/activityOperations');
const LOC_RESULT = require('./enums/locationActivityResult');

class ExportActivity extends Model {
  static get tableName() {
    return 'exportActivity';
  }

  static get idColumn() {
    return 'exportActivityId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['congregationId', 'lastCongregationLocationActivityId'],
      properties: {
        exportActivityId: { type: 'integer' },
        congregationId: { type: 'integer' },
        lastCongregationLocationActivityId: { type: 'integer' },
        timestamp: { required: true },
        source: { type: 'string', minLength: 3, maxLength: 32 }, // TODO remove this
        destination: { type: 'string', minLength: 3, maxLength: 32 },
        payload: {},
        summary: {},
      },
    };
  }

  static async getLatest(congregationId, destination) {
    return ExportActivity.query().orderBy('timestamp', 'desc').findOne({ destination, congregationId });
  }

  static async getLatestExportActivities(exportActivityId, congregationId) {
    return ExportActivity.knex().raw(`
      SELECT index-1 "recordNum", 'I' "operation", e."exportActivityId", loc->>'Id' "id", loc->>'CongregationId' "congregationId",(loc->>'Latitude')::double precision "latitude", (loc->>'Longitude')::double precision "longitude", loc->'LatLng' "latLng", loc->>'Address' "address", loc->>'Number' "number", loc->>'StreetName' "streetName", loc->>'City' "city", loc->>'State' "state", loc->>'PostalCode' "postalCode", loc->>'County' "county", loc->'Territories' territories, loc->>'TerritoryId' "territoryId", loc->>'TerritoryName' "territoryName", loc->>'Id' "locId", loc->>'Notes' "notes", loc->>'TypeId' "typeId", loc->>'Approved' "approved", loc->>'StatusId' "statusId", loc->>'StatusName' "statusName", loc->>'LanguageId' "languageId", loc->>'LanguageName' "languageName", loc->>'SourceAccount' "sourceAccount", loc->>'LocationTypeName' "locationTypeName", loc->>'SourceLocationId' "sourceLocationId", loc->>'DateLastVisited' "dateLastVisited", loc->>'Result' "result"
      FROM "exportActivity" e,
        jsonb_array_elements(e.payload#>'{inserts}') WITH ORDINALITY arr(loc, index)
      WHERE e."exportActivityId" = ? AND e."congregationId" = ?
      UNION ALL
      SELECT index-1 "recordNum", 'U' "operation", e."exportActivityId", loc->>'Id' "id", loc->>'CongregationId' "congregationId",(loc->>'Latitude')::double precision "latitude", (loc->>'Longitude')::double precision "longitude", loc->'LatLng' "latLng", loc->>'Address' "address", loc->>'Number' "number", loc->>'StreetName' "streetName", loc->>'City' "city", loc->>'State' "state", loc->>'PostalCode' "postalCode", loc->>'County' "county", loc->'Territories' territories, loc->>'TerritoryId' "territoryId", loc->>'TerritoryName' "territoryName", loc->>'Id' "locId", loc->>'Notes' "notes", loc->>'TypeId' "typeId", loc->>'Approved' "approved", loc->>'StatusId' "statusId", loc->>'StatusName' "statusName", loc->>'LanguageId' "languageId", loc->>'LanguageName' "languageName", loc->>'SourceAccount' "sourceAccount", loc->>'LocationTypeName' "locationTypeName", loc->>'SourceLocationId' "sourceLocationId", loc->>'DateLastVisited' "dateLastVisited", loc->>'Result' "result"
      FROM "exportActivity" e,
        jsonb_array_elements(e.payload#>'{updates}') WITH ORDINALITY arr(loc, index)
      WHERE e."exportActivityId" = ? AND e."congregationId" = ?
      UNION ALL
      SELECT index-1 "recordNum", 'D' "operation", e."exportActivityId", loc->>'Id' "id", loc->>'CongregationId' "congregationId",(loc->>'Latitude')::double precision "latitude", (loc->>'Longitude')::double precision "longitude", loc->'LatLng' "latLng", loc->>'Address' "address", loc->>'Number' "number", loc->>'StreetName' "streetName", loc->>'City' "city", loc->>'State' "state", loc->>'PostalCode' "postalCode", loc->>'County' "county", loc->'Territories' territories, loc->>'TerritoryId' "territoryId", loc->>'TerritoryName' "territoryName", loc->>'Id' "locId", loc->>'Notes' "notes", loc->>'TypeId' "typeId", loc->>'Approved' "approved", loc->>'StatusId' "statusId", loc->>'StatusName' "statusName", loc->>'LanguageId' "languageId", loc->>'LanguageName' "languageName", loc->>'SourceAccount' "sourceAccount", loc->>'LocationTypeName' "locationTypeName", loc->>'SourceLocationId' "sourceLocationId", loc->>'DateLastVisited' "dateLastVisited", loc->>'Result' "result"
      FROM "exportActivity" e,
        jsonb_array_elements(e.payload#>'{deletes}') WITH ORDINALITY arr(loc, index)
      WHERE e."exportActivityId" = ? AND e."congregationId" = ?`, [exportActivityId, congregationId, exportActivityId, congregationId, exportActivityId, congregationId]);
  }

  static async getTerritoryConflicts(exportActivityId, congregationId) {
    return ExportActivity.knex().raw(`
      SELECT index-1 "recordNum", e."exportActivityId", (loc->>'Latitude')::double precision "latitude", (loc->>'Longitude')::double precision "longitude", loc->>'Number' "number", loc->>'StreetName' "streetName", loc->>'City' "city", loc->>'State' "state", loc->'Territories' territories, loc->>'TerritoryId' "territoryId", loc->>'Id' "locId", loc->>'Notes' "notes"
      FROM "exportActivity" e,
	      jsonb_array_elements(e.payload#>'{inserts}') WITH ORDINALITY arr(loc, index)
      WHERE jsonb_array_length(loc->'Territories') > 1 AND loc->>'TerritoryId' IS NULL AND e."exportActivityId" = ? AND e."congregationId" = ?
      UNION ALL
      SELECT index-1 "recordNum", e."exportActivityId", (loc->>'Latitude')::double precision "latitude", (loc->>'Longitude')::double precision "longitude", loc->>'Number' "number", loc->>'StreetName' "streetName", loc->>'City' "city", loc->>'State' "state", loc->'Territories' territories, loc->>'TerritoryId' "territoryId", loc->>'Id' "locId", loc->>'Notes' "notes"
      FROM "exportActivity" e,
	      jsonb_array_elements(e.payload#>'{updates}') WITH ORDINALITY arr(loc, index)
      WHERE jsonb_array_length(loc->'Territories') > 1 AND loc->>'TerritoryId' IS NULL AND e."exportActivityId" = ? AND e."congregationId" = ?`, [exportActivityId, congregationId, exportActivityId, congregationId]);
  }

  static async resolveTerritoryConflicts({ congregationId, resolvedConflicts = [] }) {
    const exportActivityId = resolvedConflicts.length > 0 && resolvedConflicts[0].exportActivityId;
    await Promise.all(resolvedConflicts.map(async resolvedConflict => {
      const { exportActivityId, locId } = resolvedConflict;
      const recordNum = parseInt(resolvedConflict.recordNum);
      const assignedTerritory = parseInt(resolvedConflict.assignedTerritory);
      const method = locId ? 'updates' : 'inserts';
      await ExportActivity.knex().raw(`
        UPDATE "exportActivity"
        SET payload = jsonb_set(payload, '{${method},${recordNum},TerritoryId}', '${assignedTerritory}', false)
        WHERE "congregationId" = ? AND "exportActivityId" = ?`, [congregationId, exportActivityId]);
    }));

    await ExportActivity.updateSummary(congregationId, exportActivityId);
    return await ExportActivity.query().findOne({ exportActivityId, congregationId });
  }

  static async updateLocationResult(congregationId, location) {
    const { ExportActivityId, Result, ResultMessage, ResultStatusCode} = location;
    const recordNum = parseInt(location.RecordNum);
    const method = (location.Operation == OPERATIONS.INSERT ? 'inserts' : (location.Operation == OPERATIONS.UPDATE ? 'updates' : 'deletes'));
    await ExportActivity.knex().raw(`
        UPDATE "exportActivity"
        SET payload = jsonb_set(payload, '{${method},${recordNum}}', payload->'${method}'->${recordNum} || '{"Result": "${Result}", "ResultMessage": "${ResultMessage}", "ResultStatusCode": "${ResultStatusCode}"}', false)
        WHERE "congregationId" = ? AND "exportActivityId" = ?`, [congregationId, ExportActivityId]);
  }

  static async updateSummary(congregationId, exportActivityId) {
    const exportActivity = await ExportActivity.query().findOne({ exportActivityId, congregationId });
    if (exportActivity) {
      //FIXME this could be optimized
      const allLocationActivities = [...exportActivity.payload.inserts, ...exportActivity.payload.updates, ...exportActivity.payload.deletes];
      const territoryConflictCount = exportActivity.payload.inserts.filter(x => x.Territories.length > 1 && x.TerritoryId == null).length +
        exportActivity.payload.updates.filter(x => x.Territories.length > 1 && x.TerritoryId == null).length;

      const missingTerritoryCount = exportActivity.payload.inserts.filter(x => x.Territories.length === 0 && x.TerritoryId == null).length +
        exportActivity.payload.updates.filter(x => x.Territories.length === 0 && x.TerritoryId == null).length;

      let errorCount = 0, successCount = 0;
      allLocationActivities.forEach(la => {
        if (la.Result == LOC_RESULT.SUCCESS) {
          successCount++;
        } else if (la.Result == LOC_RESULT.ERROR) {
          errorCount++;
        }
      });

      await ExportActivity.knex().raw(`
        UPDATE "exportActivity"
        SET summary = summary || '{"territoryConflictCount": ${territoryConflictCount}, "successCount": ${successCount}, "errorCount": ${errorCount}, "missingTerritoryCount": ${missingTerritoryCount}}'
        WHERE "congregationId" = ? AND "exportActivityId" = ?`, [congregationId, exportActivityId]);
    }
  }
}

module.exports = ExportActivity;
