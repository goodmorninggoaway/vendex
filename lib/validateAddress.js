const { promisify } = require('util');
const USPS = require('usps-webtools');
const invert = require('lodash/invert');

const usps = new USPS({
    server: 'http://production.shippingapis.com/ShippingAPI.dll',
    userId: process.env.USPS_API_USERNAME,
    ttl: 10000,
});

const MAP = {
    addressLine1: 'street1',
    addressLine2: 'street2',
    city: 'city',
    province: 'state',
    postalCode: 'zip5',
};

const REVERSE_MAP = invert(MAP);
const forwardMap = o => Object.entries(o).reduce((memo, [key, value]) => ({ ...memo, [MAP[key]]: value }), {});
const reverseMap = o => Object.entries(o).reduce((memo, [key, value]) => ({ ...memo, [REVERSE_MAP[key]]: value }), {});

const validateAddress = async (externalLocation) => {
    const validated = await new Promise((resolve, reject) => {
        usps.verify(forwardMap(externalLocation), (err, validated) => {
            if (err) {
                reject(err);
            } else {
                resolve(validated);
            }
        });
    });

    if (validated) {
        return reverseMap(validated);
    }
};

module.exports = validateAddress;