const { serializeTasks } = require('../../util');
const Pipeline = require('../../pipeline');
const translateToLocation = require('./translateToLocation');
const translateToCongregationLocation = require('./translateToCongregationLocation');

exports.requires = ['sourceData', 'source', 'congregation'];
exports.returns = 'importedLocations';
exports.handler = async function importLocations({ sourceData, congregation, source }) {
  return await serializeTasks(sourceData.map(externalLocation => () => (
    new Pipeline({ congregation, source, externalLocation })
      .addHandler(translateToLocation)
      .addHandler(translateToCongregationLocation)
      .execute()))
  );
};
