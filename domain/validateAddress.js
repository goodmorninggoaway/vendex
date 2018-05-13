/* eslint-disable camelcase */
const { parseLocation } = require('parse-address');

const buildAddressString = (...parts) => parts.reduce((memo, part) => (part ? `${memo} ${part}` : memo), '').trim();

module.exports.buildAddressString = buildAddressString;

module.exports.getAddressParts = address => {
  const parsed = parseLocation(address);
  const {
    number,
    prefix,
    street,
    type,
    suffix,
    city,
    state,
    zip,
    sec_unit_type,
    sec_unit_num,
  } = parsed;

  return {
    number,
    city,
    state,
    zip,
    sec_unit_type,
    sec_unit_num,
    street: buildAddressString(prefix, street, type, suffix),
  };
};

module.exports.getNormalizedAddressParts = address => {
  const {
    number,
    prefix,
    street,
    type,
    suffix,
    city,
    state,
    zip,
    sec_unit_type,
    sec_unit_num,
  } = parseLocation(address);
  return {
    number: number || '',
    prefix: prefix || '',
    street: street || '',
    type: type || '',
    suffix: suffix || '',
    city: city || '',
    state: state || '',
    zip: zip || '',
    sec_unit_type: sec_unit_type || '',
    sec_unit_num: sec_unit_num || '',
  };
};

module.exports.validateAddress = function validateAddress(externalLocation) {
  const { addressLine1, addressLine2, city, zip, state } = externalLocation;
  const address = `${addressLine1 || ''} ${addressLine2 || ''} ${city ||
  ''} ${state || ''} ${zip}`;
  const location = parseLocation(address);
  if (!location) {
    return false;
  }

  return Object.entries(location).reduce(
    (memo, [key, value]) =>
      Object.assign({}, memo, { [key]: value.toLowerCase() }),
    {},
  );
};

module.exports.cleanSuite = function cleanSuite(suite) {
  if (!suite) {
    return suite;
  }

  const lcase = suite.toLowerCase();
  if (lcase.includes('apt') || lcase.includes('ste') || lcase.includes('suite') || lcase.includes('#')) {
    return suite;
  }

  return `Apt ${suite}`;
};
