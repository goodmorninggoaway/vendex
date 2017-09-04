const { promisify } = require('util');
const googleMapsClient = require('@google/maps').createClient({ key: process.env.GOOGLE_API_KEY });
const geocode = promisify(googleMapsClient.geocode);
const DAL = require('./dataAccess').DAL;

const mapGeocodedResult = (geocodeResults) => {
    if (geocodeResults.length) {
        const {
            address_components,
            geometry: { location: { lat: latitude, lng: longitude } },
            place_id,
        } = geocodeResults[0];

        const {
            street_number: number,
            route: street,
            locality: city,
            administrative_area_level_1: state,
            country: countryCode,
            postal_code: zip,
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
            number,
            street,
            city,
            zip,
            state,
            countryCode,
            externalLocationId: place_id,
            externalLocationLastRefreshedDateTime: new Date().toISOString(),
            externalSource: 'GOOGLE',
        };
    }

    return {}; //  TODO return error
};

const geocodeExport = async (address) => {
    const addressSlug = address.toLowerCase().replace(/ /g, '_');

    let response = await DAL.findGeocodeResponse({ address: addressSlug });
    if (!response) {
        response = await geocode({ address });

        try {
            await DAL.insertGeocodeResponse({ address: addressSlug, response, source: 'GOOGLE' });
        } catch (error) {
            if (error.code.startsWith('23')) {
                return await geocodeExport(address);
            } else {
                throw error;
            }
        }
    } else {
        response = response.response;
    }

    if (response.json.status !== 'OK') {
        console.log(response.json);
        return false;
    }

    return mapGeocodedResult(response.json.results);
};

module.exports = geocodeExport;