const keyBy = require('lodash/keyBy');
const groupBy = require('lodash/groupBy');
const property = require('lodash/property');
const { serializeTasks } = require('../util');

let db;

exports.initialize = (_db) => {
  db = _db;
};

const select = async ({ filter, columns, table }) => {
  return await db.from(table).where(filter).select(columns);
};

const selectFirstOrDefault = async (...args) => {
  const result = await select(...args);
  return result.length ? result[0] : null;
};

const insert = async ({ values, table, idColumn }) => {
  if (idColumn) {
    const [id] = await db(table).insert(values).returning(idColumn);
    return Object.assign({}, values, { [idColumn]: id });
  }

  return await db(table).insert(values);
};

const update = async ({ filter, update, table }) => {
  return await db(table).where(filter).update(update);
};

exports.findCongregation = (filter) => selectFirstOrDefault({ filter, table: 'congregation' });
exports.insertCongregation = (values) => insert({
  values,
  table: 'congregation',
  idColumn: 'congregationId'
});
exports.findLocation = (filter) => selectFirstOrDefault({ filter, table: 'location' });
exports.insertLocation = (values) => insert({ values, table: 'location', idColumn: 'locationId' });
exports.findCongregationLocation = (filter) => selectFirstOrDefault({
  filter,
  table: 'congregationLocation'
});
exports.updateCongregationLocation = (congregationId, locationId, value) => update({
  filter: { congregationId, locationId },
  update: value,
  table: 'congregationLocation'
});

exports.insertCongregationLocation = (values) => insert({
  values,
  table: 'congregationLocation',
});

exports.deleteCongregationLocation = (filter) => db('congregationLocation').where(filter).del();

exports.findGeocodeResponse = (filter) => selectFirstOrDefault({ filter, table: 'geocodeResponse' });
exports.insertGeocodeResponse = (values) => insert({
  values,
  table: 'geocodeResponse',
  idColumn: 'geocodeResponseId'
});

exports.findTerritory = (filter) => selectFirstOrDefault({ filter: Object.assign({}, filter, { deleted: 0 }), table: 'territory' });
exports.getTerritories = (filter) => select({ filter: Object.assign({}, filter, { deleted: 0 }), table: 'territory' });
exports.findTerritoryContainingPoint = (congregationId, { longitude, latitude }) => (
  db('territory').where({ deleted: 0 }).whereRaw('"congregationId" = ? and "boundary" @> point (?, ?)', [congregationId, longitude, latitude])
);

exports.insertTerritory = (values) => insert({ values, table: 'territory', idColumn: 'territoryId' });
exports.updateTerritory = (filter, updates) => update({ filter, update: updates, table: 'territory' });
exports.deleteTerritory = (territoryId) => exports.updateTerritory({ territoryId }, { deleted: 1 });

exports.getLocationsForCongregationFromSource = async (congregationId, source) => {
  const locationsPromise = db.from('location')
    .innerJoin('congregationLocation', 'location.locationId', 'congregationLocation.locationId')
    .where({ congregationId, externalSource: source })
    .select('location.*');

  const congregationLocationsPromise = db.from('congregationLocation').where({ congregationId, source }).select();

  const [locations, congregationLocations] = await Promise.all([locationsPromise, congregationLocationsPromise]);
  const indexedCL = keyBy(congregationLocations, property('locationId'));

  return locations.map(location => ({ location, congregationLocation: indexedCL[location.locationId] }));
};

exports.getLocationsForCongregation = async (congregationId) => {
  const locationsPromise = db.from('location')
    .innerJoin('congregationLocation', 'location.locationId', 'congregationLocation.locationId')
    .where({ congregationId })
    .select('location.*');

  const congregationLocationsPromise = db.from('congregationLocation').where({ congregationId }).select();

  const [locations, congregationLocations] = await Promise.all([locationsPromise, congregationLocationsPromise]);
  const indexedCL = groupBy(congregationLocations, property('locationId'));

  return locations.map(location => ({ location, congregationLocations: indexedCL[location.locationId] }));
};

exports.getLastExportActivity = async (filter) => {
  const result = await db.from('exportActivity').where(filter).orderBy('lastCongregationLocationActivityId', 'desc').limit(1);
  return result.length ? result[0] : null;
};

exports.insertExportActivity = (values) => insert({ values, table: 'exportActivity', idColumn: 'exportActivityId' });

exports.addCongregationLocationActivity = (values) => insert({
  values,
  idColumn: 'congregationLocationActivityId',
  table: 'congregationLocationActivity',
});

exports.getCongregationLocationActivity = (filter, startAt) => db
  .from('congregationLocationActivity')
  .where(filter)
  .where('congregationLocationActivityId', '>=', startAt)
  .orderBy('congregationLocationActivityId');

exports.reset = (includeGeocode = false) => {
  const tables = [
    'exportActivity',
    'congregationLocationActivity',
    'congregationLocation',
    'location',
    'territory',
  ];

  if (includeGeocode) {
    tables.push('geocodeResponse');
  }

  return serializeTasks(tables.map(x => () => db(x).del()));
};


exports.insertLanguage = (values) => insert({ values, table: 'language', idColumn: 'languageId' });
exports.updateLanguage = (filter, updates) => update({ filter, update: updates, table: 'language' });
exports.deleteLanguage = (languageId) => exports.updateLanguage({ languageId }, { deleted: 1 });
exports.findLanguage = (synonym) => db.from('language').whereRaw('? = ANY (synonyms)', synonym).first();
