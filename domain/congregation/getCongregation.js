const { DAL } = require('../dataAccess');

exports.requires = ['congregationId'];
exports.returns = 'congregation';
exports.handler = function getCongregation({ congregationId }) {
  return DAL.getCongregationWithIntegrations(congregationId);
};
