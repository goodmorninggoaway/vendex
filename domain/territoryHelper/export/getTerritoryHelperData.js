const thApi = require('../../../server/auth/territory-helper-oauth');

module.exports = async (tokens, res) => {
  const { CongregationId } = await thApi.getMyProfile(tokens, res);
  const locationTypes = await thApi.getLocationTypes(tokens, res);
  const locationStatuses = await thApi.getLocationStatuses(tokens, res);
  const locationLanguages = await thApi.getLocationLanguages(tokens, res);

  return {
    destinationCongregationId: CongregationId,
    locationTypes,
    locationStatuses,
    locationLanguages
  };
};
