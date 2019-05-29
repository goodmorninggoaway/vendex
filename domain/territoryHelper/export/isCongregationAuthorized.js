const AlbaIntegration = require('../../models/AlbaIntegration');

exports.requires = ['congregation', 'sourceCongregationLocation'];
exports.returns = 'sourceCongregationLocation';
exports.handler = async function isCongregationAuthorized({ sourceCongregationLocation, congregation }) {
  const hasIt = await AlbaIntegration.hasIntegration({
    congregationId: congregation.congregationId,
    language: sourceCongregationLocation.language,
    source: sourceCongregationLocation.source,
  });

  return hasIt ? sourceCongregationLocation : null;
};
