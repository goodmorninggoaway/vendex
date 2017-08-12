const geocode = require('../../util/geocode');
const genericConverter = require('../../util/genericConverter');

const TH_BRIDGE_MAP = {
    id: null,
    territoryType: 'Territory type',
    territoryId: 'Territory number',
    locationType: 'Location type',
    language: 'Language',
    contactType: 'Status',
    latitude: 'Latitude',
    longitude: 'Longitude',
    addressDescription: 'Address',
    addressLine1: 'Number',
    addressLine2: null,
    street: 'Street',
    city: 'City',
    postalCode: 'Postal code',
    state: 'State',
    countryCode: 'Country code',
    notes: 'Notes',
    lastVisit: 'Last visited',
    updated: 'Last updated',
    created: 'Date created',
};

const getAddress = location => location[TH_BRIDGE_MAP.addressDescription];

module.exports = {
    toGeneric(location) {
        return geocode(getAddress(location))
            .then(geocodeResult => genericConverter.toGeneric('th', TH_BRIDGE_MAP, geocodeResult, location));
    },
    fromGeneric(genericLocation) {
        return genericConverter.fromGeneric(TH_BRIDGE_MAP, genericLocation);
    },
};