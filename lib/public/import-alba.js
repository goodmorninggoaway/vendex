const { congregationId, file, source } = require('../options');

const util = require('util');
const csv = require('csvtojson');
const differenceBy = require('lodash/differenceBy');
const hash = require('object-hash');
const geocode = require('../geocode');
const validateAddress = require('../validateAddress');
const DAL = require('../dataAccess').DAL;

if (source !== 'ALBA') {
    throw new Error('Invalid source for this interface')
}

const loadFile = async (file) => {
    console.log('loading csv file', file);
    const result = await new Promise((resolve, reject) => {
        const rows = [];

        csv({ delimiter: '\t' })
            .fromFile(file)
            .on('json', (jsonObj) => {
                rows.push(jsonObj);
            })
            .on('done', (error) => {
                if (error) {
                    return reject(error);
                }

                resolve(rows);
            });
    });
    console.log('loaded csv file', result.length);
    return result;
};


const importLocation = ({ locations }) => async (externalLocation) => {


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

    const translatedLocation = {
        addressLine1: externalLocation.Address,
        addressLine2: externalLocation.Suite,
        city: externalLocation.City,
        postalCode: externalLocation['Postal_code'],
        province: externalLocation.Province,
        countryCode: externalLocation.Country,
    };

    let translatedCongregationLocation = {
        congregationId,
        source,
        language: externalLocation.Language.toUpperCase(), // TODO create automanaged enumeration
        sourceLocationId: externalLocation.Address_ID,
        isPendingTerritoryMapping: 0,
        isDeleted: 0,
        isActive: 1,
        notes: externalLocation.Notes,
        userDefined1: externalLocation.Kind,
        userDefined2: externalLocation.Account,
    };

    const validatedAddress = await validateAddress(translatedLocation);
    if (!validatedAddress) {
        return; // TODO log an error
    }

    const addressHash = hash.sha1(validatedAddress);
    let { location, congregationLocation } = locations.find(x => x.location.externalLocationId === addressHash) || {};
    // TODO mark the address as "encountered" so we can handle the negative space

    if (!location) {
        location = {
            ...translatedLocation,
            ...(await geocode(externalLocation.Address)),
            externalLocationId: addressHash,
            externalSource: 'USPS',
        };

        location = await DAL.insertLocation(location);
    }

    const { locationId } = location;
    const territory = await DAL.findTerritory({
        congregationId,
        externalTerritorySource: source,
        externalTerritoryId: 1,
    });

    translatedCongregationLocation = {
        ...translatedCongregationLocation,
        locationId,
        territoryId: territory ? territory.territoryId : null,
    };

    if (!congregationLocation) {
        congregationLocation = await DAL.insertCongregationLocation(translatedCongregationLocation);
        await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'I', source });

    } else {
        let hasDiff = false;
        const diff = Object.entries(translatedCongregationLocation).reduce((memo, [key, value]) => {
            if (congregationLocation[key] !== value) {
                memo[key] = value;
                hasDiff = true;
            }

            return memo;
        }, {});

        if (hasDiff) {
            await DAL.updateCongregationLocation(congregationId, locationId, diff);
            await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'U', source });
            congregationLocation = { ...congregationLocation, ...diff };
        }
    }

    return { location, congregationLocation };
};

const doStuff = async () => {
    const sourceData = (await loadFile(file)).slice(0, 1);
    const existingLocations = await DAL.getLocationsForCongregation(congregationId);
    const updatedLocations = await Promise.all(sourceData.map(importLocation({ locations: existingLocations })));

    const deletedLocations = differenceBy(existingLocations, updatedLocations, 'location.locationId');

    await Promise.all(deletedLocations.map(
        async ({ congregationLocation: { congregationId, locationId } }) => {
            await DAL.deleteCongregationLocation({ congregationId, locationId });
            await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'D', source });
        }
    ));
};

doStuff()
// .then(x => console.log(x))
    .then(x => process.exit(0))
    .catch(x => {
        console.error(x);
        process.exit(1);
    });