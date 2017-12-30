const Pipeline = require('../../pipeline');
const LOCATION_INTERFACES = require('../../models/enums/locationInterfaces');
const getCongregation = require('../../congregation/getCongregation');
const getLatestActivities = require('../../congregationLocation/getLatestActivities');
const getIndexedLocations = require('./getIndexedLocations');
const convertActivitiesToExternalLocations = require('./convertActivitiesToExternalLocations');
const createExcelFile = require('./createExcelFile');

module.exports = async ({ congregationId, exportType, tracer }) => {
  const pipeline = new Pipeline({ congregationId, destination: LOCATION_INTERFACES.TERRITORY_HELPER, exportTracer: tracer })
    .addHandler(getCongregation)
    .addHandler(getLatestActivities)
    .addHandler(getIndexedLocations)
    .addHandler(convertActivitiesToExternalLocations);

  if (exportType === 'excel') {
    const { buffer } = await pipeline.addHandler(createExcelFile).execute();
    return buffer;
  }

  return await pipeline.execute();
};
