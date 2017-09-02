const { parseLocation } = require('parse-address');

module.exports = function validateAddress(externalLocation) {
    const { addressLine1, addressLine2, city, postalCode, province } = externalLocation;
    const address = `${addressLine1 || ''} ${addressLine2 || ''} ${city || ''} ${province || ''} ${postalCode}`;
    const location = parseLocation(address);
    if (!location) {
        return false;
    }

    return Object.entries(location).reduce((memo, [key, value]) => ({ ...memo, [key]: value.toLowerCase() }), {});
};