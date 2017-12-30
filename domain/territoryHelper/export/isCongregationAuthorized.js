exports.requires = ['congregation', 'sourceCongregationLocation'];
exports.returns = 'sourceCongregationLocation';
exports.handler = async function isCongregationAuthorized({ sourceCongregationLocation, congregation }) {
  if (congregation.integrationSources.some(({ sourceCongregation }) => sourceCongregation.congregationId === sourceCongregationLocation.sourceCongregationId)) {
    return sourceCongregationLocation;
  }

  return null;
};
