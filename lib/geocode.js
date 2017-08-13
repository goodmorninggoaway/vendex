const jsonfile = require('jsonfile');
const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GOOGLE_API_KEY,
});

const file = '/Users/mjd/code/thalba-sync/.samples/geocode.json';

module.exports = (address) => new Promise((resolve, reject) => {
    try {
        const data = jsonfile.readFileSync(file);
        return resolve(data);
    } catch (err) {
        console.log(err, 'hitting Google');
    }

    googleMapsClient.geocode({ address }, (err, response) => {
        if (err) {
            return reject(err);
        }

        jsonfile.writeFileSync(file, response.json.results);

        resolve(response.json.results);
    });
})
    .then((geocodeResults) => {
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
            };
        }

        return {}; //  TODO return error
    });