exports.requires = ['location', 'sourceCongregationId', 'destination'];
exports.returns = [
  'destinationCongregationLocation',
  'sourceCongregationLocation',
];
exports.handler = function getActivityAttributes({
  sourceCongregationId,
  destination,
  location,
}) {
  return {
    destinationCongregationLocation: location.congregationLocations.find(
      x => x.source === destination,
    ), // TODO rename to existingCongregationLocation
    sourceCongregationLocation: location.congregationLocations.find(
      x => x.sourceCongregationId === sourceCongregationId,
    ),
  };
};
