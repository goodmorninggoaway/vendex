const jsonfile = require('jsonfile');
const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GOOGLE_API_KEY,
});

const file = '/Users/mjd/code/thalba-sync/.samples/geocode.json';

module.exports = (address) => {
    return new Promise((resolve, reject) => {
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

            // console.log(JSON.stringify(response.json.results, null, 2));
            resolve(response.json.results);
        });
    })
};