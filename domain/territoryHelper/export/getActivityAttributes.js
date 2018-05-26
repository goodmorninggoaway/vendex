exports.requires = ['location', 'destination'];
exports.returns = ['destinationCongregationLocation', 'sourceCongregationLocation'];
exports.handler = function getActivityAttributes({ destination, location }) {
  return {
    // TODO rename to existingCongregationLocation
    destinationCongregationLocation: location.congregationLocations.find(x => x.source === destination),
    sourceCongregationLocation: location.congregationLocations.find(x => x.source !== destination),
  };
};
