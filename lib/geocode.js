const { promisify } = require('util');
const googleMapsClient = require('@google/maps').createClient({ key: process.env.GOOGLE_API_KEY });
const geocode = promisify(googleMapsClient.geocode);
const DAL = require('./dataAccess').DAL;

const mapGeocodedResult = (geocodeResults) => {
    if (geocodeResults.length) {
        const {
            address_components,
            formatted_address: addressLine2,
            geometry: { location: { lat: latitude, lng: longitude } },
            place_id,
        } = geocodeResults[0];

        const {
            street_number: addressLine1,
            route: street,
            locality: city,
            administrative_area_level_1: province,
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
            latitude,
            longitude,
            addressLine1,
            addressLine2,
            street,
            city,
            province,
            countryCode,
            postalCode,
            externalLocationId: place_id,
            externalLocationLastRefreshedDateTime: new Date().toISOString(),
            externalSource: 'GOOGLE',
        };
    }

    return {}; //  TODO return error
};

module.exports = async (address) => {
    const addressSlug = address.toLowerCase().replace(/ /g, '_');

    let response = await DAL.findGeocodeResponse({ address: addressSlug });
    if (!response) {
        response = await geocode({ address });
        await DAL.insertGeocodeResponse({ address: addressSlug, response, source: 'GOOGLE' });
    } else {
        response = response.response;
    }

    return mapGeocodedResult(response.json.results);
};
