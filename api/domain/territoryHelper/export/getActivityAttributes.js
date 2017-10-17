exports.requires = ['indexedLocations', 'sourceCongregationId', 'locationId', 'destination'];
exports.returns = ['destinationCongregationLocation', 'sourceCongregationLocation', 'location'];
exports.handler = async function getActivityAttributes({ indexedLocations, sourceCongregationId, locationId, destination }) {
  const location = indexedLocations[locationId];

  // Somehow this got in the mix even though it's not (or no longer) associated wth the congregation
  if (!location) {
    return;
  }

  const destinationCongregationLocation = location.congregationLocations.find(x => x.source === destination);
  const sourceCongregationLocation = location.congregationLocations.find(x => x.sourceCongregationId === sourceCongregationId);

  return { destinationCongregationLocation, sourceCongregationLocation, location };
};
