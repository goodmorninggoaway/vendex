const geocode = require('../util/geocode');

const ALBA_BRIDGE_MAP = {
    id: 'Address_ID',
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

module.exports = location => geocode(getAddress(location))
    .then((geocodeResults) => {
        if (geocodeResults.length) {
            const {
                address_components,
                formatted_address: addressDescription,
                geometry: { location: { lat: latitude, lng: longitude } },
            } = geocodeResults[0];

            const {
                street_number: addressLine1,
                route: street,
                locality: city,
                administrative_area_level_1: state,
                country: countryCode,
                postal_code: postalCode,
            } = address_components
                .reduce((memo, { short_name, types }) => {
                    return types.reduce((_, type) => {
                        memo[type] = short_name;
                        return memo;
                    }, memo)
                }, {});

            return {
                addressDescription,
                latitude,
                longitude,
                addressLine1,
                street,
                city,
                state,
                countryCode,
                postalCode
            };
        }

        return {};
    })
    .then((geocodeResult) => {
        const simplyMatched = Object
            .entries(ALBA_BRIDGE_MAP)
            .reduce((memo, [key, value]) => {
                memo[key] = value ? location[value] : null;
                return memo;
            }, {});
        return Object.assign({}, simplyMatched, geocodeResult);
    });