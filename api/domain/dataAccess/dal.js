const keyBy = require('lodash/keyBy');
const groupBy = require('lodash/groupBy');
const property = require('lodash/property');
const map = require('lodash/map');
const { executeSerially } = require('../util');

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

exports.getCongregationWithIntegrations = async (congregationId) => {
  const congregation = await selectFirstOrDefault({ filter: { congregationId }, table: 'congregation' });
  if (!congregation) {
    return congregation;
  }

  const sources = await db('congregationIntegration')
    .where('destinationCongregationId', congregationId)
    .then(integrations => db('congregation').whereIn('congregationId', map(integrations, 'sourceCongregationId')));

  const destinations = await db('congregationIntegration')
    .where('sourceCongregationId', congregationId)
    .then(integrations => db('congregation').whereIn('congregationId', map(integrations, 'destinationCongregationId')));

  return Object.assign(congregation, { sources, destinations });
};
exports.insertCongregation = (values) => insert({
  values,
  table: 'congregation',
  idColumn: 'congregationId'
});
exports.getCongregations = (filter = {}) => select({ filter, table: 'congregation' });
exports.updateCongregation = (congregationId, value) => update({ update: value, filter: { congregationId }, table: 'congregation' });
exports.deleteCongregation = (congregationId) => db('congregation').where({ congregationId }).del();
exports.addCongregationIntegration = (sourceCongregationId, destinationCongregationId) => insert({
  table: 'congregationIntegration',
  values: { sourceCongregationId, destinationCongregationId },
  idColumn: 'congregationIntegrationId'
});
exports.deleteCongregationIntegration = (sourceCongregationId, destinationCongregationId) => db('congregationIntegration')
  .where({ sourceCongregationId, destinationCongregationId })
  .del();

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

exports.getLastExportActivity = (filter) => db.from('exportActivity').where(filter).orderBy('lastCongregationLocationActivityId', 'desc').first();
exports.insertExportActivity = (values) => insert({ values, table: 'exportActivity', idColumn: 'exportActivityId' });

exports.addCongregationLocationActivity = (values) => insert({
  values,
  idColumn: 'congregationLocationActivityId',
  table: 'congregationLocationActivity',
});

exports.getCongregationLocationActivity = ({ congregationId, destination, minCongregationLocationActivityId }) => db
  .from('congregationLocationActivity')
  .innerJoin('congregationIntegration', 'congregationLocationActivity.congregationId', 'congregationIntegration.sourceCongregationId')
  .where('congregationLocationActivityId', '>=', minCongregationLocationActivityId)
  .where('destinationCongregationId', congregationId)
  .select('congregationLocationActivity.*')
  .orderBy('congregationLocationActivityId');

exports.reset = () => {
  const tables = [
    'exportActivity',
    'congregationLocationActivity',
    'congregationLocation',
    'location',
    'territory',
  ];

  return executeSerially(tables, table => db(table).del());
};


exports.insertLanguage = (values) => insert({ values, table: 'language', idColumn: 'languageId' });
exports.updateLanguage = (filter, updates) => update({ filter, update: updates, table: 'language' });
exports.deleteLanguage = (languageId) => exports.updateLanguage({ languageId });
exports.findLanguage = (synonym) => db.from('language').whereRaw('? = ANY (synonyms)', synonym).first();
exports.findLanguageById = (languageId) => db.from('language').where({ languageId }).first();
exports.getLanguages = (filter = {}) => select({ filter, table: 'language' });
