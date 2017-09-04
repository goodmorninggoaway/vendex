const { parseLocation } = require('parse-address');


module.exports.getAddressParts = (address) => {
    const { number, prefix, street, type, suffix, city, state, zip, sec_unit_type, sec_unit_num } = parseLocation(address);
    return {
        number, city, state, zip, sec_unit_type, sec_unit_num,
        street: `${prefix ? prefix + ' ' : ''}${street } ${type ? type + ' ' : ''}${suffix ? suffix + ' ' : ''}`
    };
};

module.exports.getNormalizedAddressParts = (address) => {
    const { number, prefix, street, type, suffix, city, state, zip, sec_unit_type, sec_unit_num } = parseLocation(address);
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
    const address = `${addressLine1 || ''} ${addressLine2 || ''} ${city || ''} ${state || ''} ${zip}`;
    const location = parseLocation(address);
    if (!location) {
        return false;
    }

    return Object.entries(location).reduce((memo, [key, value]) => ({ ...memo, [key]: value.toLowerCase() }), {});
};

