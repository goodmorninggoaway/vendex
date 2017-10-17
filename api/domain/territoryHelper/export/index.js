const Pipeline = require('../../pipeline');
const LOCATION_INTERFACES = require('../../models/enums/locationInterfaces');
const getCongregation = require('../../congregation/getCongregation');
const getLatestActivities = require('../../congregationLocation/getLatestActivities');
const getIndexedLocations = require('./getIndexedLocations');
const convertActivitiesToExternalLocations = require('./reconcileActivities');

module.exports = async ({ congregationId }) => {
  return await new Pipeline({ congregationId, destination: LOCATION_INTERFACES.TERRITORY_HELPER })
    .addHandler(getCongregation)
    .addHandler(getLatestActivities)
    .addHandler(getIndexedLocations)
    .addHandler(convertActivitiesToExternalLocations)
    .execute();
};
