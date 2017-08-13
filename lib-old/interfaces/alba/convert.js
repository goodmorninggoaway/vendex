const geocode = require('../../util/geocode');
const genericConverter = require('../../util/genericConverter');

const ALBA_BRIDGE_MAP = {
    externalId: 'Address_ID',
    territoryType: null,
    territoryId: null,
    locationType: 'Account',
    language: 'Language',
    contactType: 'Kind',
    latitude: null,
    longitude: null,
    addressDescription: 'Address',
    addressLine1: null,
    addressLine2: 'Suite',
    street: 'Address',
    city: 'City',
    postalCode: 'Postal_code',
    state: 'Province',
    countryCode: 'Country',
    notes: 'Notes',
    lastVisit: null,
    updated: null,
    created: null,
};

const getAddress = location => `${location[ALBA_BRIDGE_MAP.addressDescription] || ''} ${location[ALBA_BRIDGE_MAP.addressLine2] || ''} ${location[ALBA_BRIDGE_MAP.city] || ''} ${location[ALBA_BRIDGE_MAP.state] || ''} ${location[ALBA_BRIDGE_MAP.postalCode] || ''}`;

module.exports = {
    toGeneric(location) {
        return geocode(getAddress(location))
            .then(geocodeResult => genericConverter.toGeneric('alba', ALBA_BRIDGE_MAP, geocodeResult, location));
    },
    fromGeneric(genericLocation) {
        return genericConverter.fromGeneric(ALBA_BRIDGE_MAP, genericLocation);
    },
};