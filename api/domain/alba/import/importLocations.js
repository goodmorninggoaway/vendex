const { taskIterator } = require('../../util');
const Pipeline = require('../../pipeline');
const translateToLocation = require('./translateToLocation');
const translateToCongregationLocation = require('./translateToCongregationLocation');

exports.requires = ['sourceData', 'source', 'congregation'];
exports.returns = 'importedLocations';
exports.handler = async function importLocations({ sourceData, congregation, source }) {
  const createTask = externalLocation => () => (
    new Pipeline({ congregation, source, externalLocation })
      .addHandler(translateToLocation)
      .addHandler(translateToCongregationLocation)
      .execute()
  );

  const result = [];
  for (task of taskIterator(sourceData, createTask)) {
    result.push(await task());
  }

  return result;
};
