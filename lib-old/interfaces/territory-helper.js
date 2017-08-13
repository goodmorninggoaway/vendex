const geocode = require('../../util/geocode');

const MAP = {
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

const importMapper = ({ congregationId, languageId, isPendingTerritoryMapping, externalLocation }) =>
    (geocoded) => {
        return {
            location: {
                addressLine1: externalLocation.Number,
                addressLine2: externalLocation.Address,
                street: externalLocation.Street,
                city: externalLocation.City,
                postalCode: externalLocation['Postal code'],
                province: externalLocation.State,
                countryCode: externalLocation['Country code'],
                ...geocoded,
            },
            congregationLocation: {
                congregationId,
                languageId,
                source: 'TERRITORY HELPER',
                sourceLocationId: null,
                isPendingTerritoryMapping,
                isDeleted: false,
                isActive: true,
                notes: externalLocation.Notes,
                userDefined1: externalLocation.Status,
            },
        };

    };

const convertExternal = ({ externalLocation, congregationId, languageId }) =>
    geocode(externalLocation.Address)
        .then(importMapper({ congregationId, languageId, isPendingTerritoryMapping: true, externalLocation }));


module.exports = convertExternal;