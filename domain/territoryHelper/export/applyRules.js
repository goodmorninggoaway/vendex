const TAGS = require('../../models/enums/tags');
const MESSAGE_LEVEL = require('../../models/enums/exportMessageLevel');
const OPERATIONS = require('../../models/enums/activityOperations');

const booleanOperation = operation => ({
  isDelete: operation === 'D',
  isUpdate: operation === 'U',
  isInsert: operation === 'I',
});

exports.requires = ['sourceCongregationLocation', 'congregation', 'operation'];
exports.optional = ['destinationCongregationLocation'];
exports.returns = [
  'nextCongregationLocation',
  'operation',
  '$messageLevel',
  '$message',
];
exports.handler = async function applyRules({
  destinationCongregationLocation,
  sourceCongregationLocation,
  congregation,
  operation,
}) {
  const isDoNotCall = sourceCongregationLocation.attributes.includes(
    TAGS.DO_NOT_CALL,
  );
  const isForeignLanguageInSource =
    sourceCongregationLocation.language !== congregation.language;
  const isLocalLanguageInSource =
    sourceCongregationLocation.language === congregation.language;
  const isForeignLanguageInDestination =
    destinationCongregationLocation &&
    destinationCongregationLocation.attributes.includes(TAGS.FOREIGN_LANGUAGE);
  const isActiveInSource =
    sourceCongregationLocation.attributes.includes(TAGS.FOREIGN_LANGUAGE) &&
    !sourceCongregationLocation.attributes.includes(TAGS.PENDING);

  const { isInsert } = booleanOperation(operation);
  const existsInDestination =
    destinationCongregationLocation &&
    Object.keys(destinationCongregationLocation).length > 1;

  // Converted to a local-language DNC in the foreign-language system, so add/update it as a DNC
  if (isDoNotCall && !isForeignLanguageInSource) {
    if (isForeignLanguageInDestination && !isInsert) {
      // Assume it came from the source
      return false;
    }

    return {
      operation,
      $messageLevel: MESSAGE_LEVEL.INFO,
      $message: 'Converted to a regular DNC for this congregation',
      nextCongregationLocation: Object.assign({}, sourceCongregationLocation, {
        attributes: [TAGS.DO_NOT_CALL, TAGS.PLACE_TYPE_SINGLE_FAMILY],
      }),
    };
  }

  if (
    !isDoNotCall &&
    !isForeignLanguageInSource &&
    !isForeignLanguageInDestination
  ) {
    return {
      operation: OPERATIONS.DELETE,
      $messageLevel: MESSAGE_LEVEL.INFO,
      $message:
        'This location no longer tracked by a foreign-language congregation.',
      nextCongregationLocation: sourceCongregationLocation,
    };
  }

  if (
    !isActiveInSource &&
    !isForeignLanguageInSource &&
    isForeignLanguageInDestination
  ) {
    if (isInsert) {
      return false; // It was never added, so don't add it
    }

    return {
      operation: OPERATIONS.DELETE,
      $messageLevel: MESSAGE_LEVEL.INFO,
      $message:
        'This location has transitioned from foreign-language back to local-language.',
      nextCongregationLocation: sourceCongregationLocation,
    };
  }

  return {
    operation,
    nextCongregationLocation: sourceCongregationLocation,
  };
};
