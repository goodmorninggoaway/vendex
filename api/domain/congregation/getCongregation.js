const { DAL } = require('../dataAccess');

exports.requires = ['congregationId'];
exports.returns = 'congregation';
exports.handler = async function getCongregation({ congregationId }) {
  const congregation = await DAL.getCongregationWithIntegrations(congregationId);
  return congregation;
};
