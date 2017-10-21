exports.requires = ['congregation', 'sourceCongregationLocation'];
exports.returns = 'sourceCongregationLocation';
exports.handler = async function isCongregationAuthorized({ sourceCongregationLocation, congregation }) {
  if (congregation.sources.some(x => x.congregationId === sourceCongregationLocation.sourceCongregationId)) {
    return sourceCongregationLocation;
  }

  return null;
};
