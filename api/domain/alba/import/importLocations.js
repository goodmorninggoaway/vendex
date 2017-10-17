const { serializeTasks } = require('../../util');
const Pipeline = require('../../pipeline');
const translateToLocation = require('./translateToLocation');
const translateToCongregationLocation = require('./translateToCongregationLocation');

exports.requires = ['sourceData', 'congregationId', 'source'];
exports.returns = 'importedLocations';
exports.handler = async function importLocations({ sourceData, congregationId, source }) {
  return await serializeTasks(sourceData.map(externalLocation => () => (
    new Pipeline({ congregationId, source, externalLocation })
      .addHandler(translateToLocation)
      .addHandler(translateToCongregationLocation)
      .execute()))
  );
};
