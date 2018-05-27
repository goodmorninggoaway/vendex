const { transaction } = require('objection');
const { executeSerially } = require('../util');
const models = require('../models');
let knex;

exports.initialize = _knex => {
  knex = _knex;
};

exports.getCongregations = filter =>
  models.Congregation.query()
    .skipUndefined()
    .where(filter)
    .orderBy('name');
exports.findCongregation = filter => exports.getCongregations(filter).first();
exports.insertCongregation = values =>
  models.Congregation.query().insert(values);
exports.updateCongregation = (congregationId, value) =>
  models.Congregation.query()
    .skipUndefined()
    .patch(value)
    .where({ congregationId });
exports.deleteCongregation = congregationId =>
  models.Congregation.query()
    .skipUndefined()
    .del()
    .where({ congregationId });
exports.getCongregationWithIntegrations = congregationId => models.Congregation.query().where({ congregationId }).first();

exports.findLocation = filter =>
  models.Location.query()
    .skipUndefined()
    .where(filter)
    .first();
exports.insertLocation = values => models.Location.query().insert(values);

exports.findCongregationLocation = filter =>
  models.CongregationLocation.query()
    .skipUndefined()
    .where(filter)
    .first();
exports.updateCongregationLocation = (filter, value) =>
  models.CongregationLocation.query()
    .skipUndefined()
    .where(filter)
    .patch(value);

exports.insertCongregationLocation = values =>
  models.CongregationLocation.query().insert(values);

exports.findGeocodeResponse = filter =>
  models.GeocodeResponse.query()
    .where(filter)
    .first();
exports.insertGeocodeResponse = values =>
  models.GeocodeResponse.query().insert(values);

exports.getTerritories = filter =>
  models.Territory.query()
    .skipUndefined()
    .where({ deleted: false })
    .where(filter);
exports.findTerritory = filter => exports.getTerritories(filter).first();

exports.findTerritoryContainingPoint = (congregationId, { longitude, latitude }) =>
  models.Territory.query()
    .skipUndefined()
    .where({ congregationId, deleted: false })
    .whereRaw('("boundary" @> point (?, ?))', [longitude, latitude]);

exports.deleteTerritory = territoryId =>
  models.Territory.query()
    .skipUndefined()
    .where({ territoryId })
    .del();

exports.getLocationsForCongregation = congregationId =>
  models.Location.query()
    .eager('[congregationLocations]')
    .modifyEager('congregationLocations', builder =>
      builder.where({ congregationId }),
    );

exports.getLocationsForCongregationFromSource = (congregationId, source) =>
  exports
    .getLocationsForCongregation(congregationId)
    .where('externalSource', source);

exports.getLastExportActivity = filter =>
  models.ExportActivity.query()
    .skipUndefined()
    .where(filter)
    .orderBy('lastCongregationLocationActivityId', 'desc')
    .first();
exports.insertExportActivity = values =>
  models.ExportActivity.query().insert(values);

exports.reset = () => {
  const tables = [
    'exportActivity',
    'congregation_location_activity',
    'congregationLocationActivity',
    'congregationLocation',
    'location',
    'territory',
  ];

  return executeSerially(tables, table => knex(table).del());
};

exports.insertLanguage = values =>
  knex
    .table('language')
    .insert(values)
    .returning('languageId');
exports.updateLanguage = (filter, updates) =>
  knex
    .table('language')
    .where(filter)
    .update(updates)
    .returning('languageId');
exports.deleteLanguage = languageId =>
  models.Language.query()
    .where({ languageId })
    .del();
exports.findLanguageById = languageId =>
  models.Language.query()
    .where({ languageId })
    .first();
exports.findLanguage = synonym =>
  models.Language.query()
    .whereRaw('? = ANY (synonyms)', synonym)
    .first();
exports.getLanguages = (filter = {}) =>
  models.Language.query()
    .where('languageId', '>', 0)
    .where(filter)
    .orderBy('language');
