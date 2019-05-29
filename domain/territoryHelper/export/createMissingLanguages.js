const { CongregationLocation } = require('../../models');
const thApi = require('../../../server/auth/territory-helper-oauth');

exports.requires = ['tokens', 'congregationId', 'destinationCongregationId', 'response', 'locationLanguages'];
exports.returns = [];

// This is not required after all because Territory Helper will no longer support specifying langauge for a location.
exports.handler = async function getActivityAttributes({ tokens, congregationId, destinationCongregationId, response, locationLanguages }) {
  const languages = await CongregationLocation.query().distinct('language').where({ congregationId });
  await Promise.all(languages.map(async l => {
    const foundLanguage = locationLanguages.find(ll => ll.Name.toLowerCase() === l.language.toLowerCase());
    if (!foundLanguage) {
      try {
        const createdLanguage = await thApi.createLocationLanguage(tokens, response, { CongregationId: destinationCongregationId, Name: l.language });
        locationLanguages.push(createdLanguage);
      } catch (e) {
        console.error(e);
      }
    }
  }));
};
