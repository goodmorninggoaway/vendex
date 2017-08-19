// TODO Apply on-import rules
const { congregationId, file, source } = require('../options');

const util = require('util');
const excelAsJson = require('excel-as-json');
const differenceBy = require('lodash/differenceBy');
const hash = require('object-hash');
const geocode = require('../geocode');
const validateAddress = require('../validateAddress');
const DAL = require('../dataAccess').DAL;
const convertExcelToJson = util.promisify(excelAsJson.processFile);

if (source !== 'TERRITORY HELPER') {
    throw new Error('Invalid source for this interface')
}

const loadFile = async (file) => {
    console.log('loading excel file', file);
    const result = await convertExcelToJson(file, null, {});
    console.log('loaded excel file', result.length);
    return result;
};

const importLocation = ({ locations }) => async (externalLocation) => {
    // Ignore english DNCs
    if (externalLocation.Status !== 'Language') {
        // return;
    }

    const translatedLocation = {
        addressLine1: externalLocation.Number + ' ' + externalLocation.Street,
        // addressLine2: externalLocation.Address,
        city: externalLocation.City,
        postalCode: externalLocation['Postal code'],
        province: externalLocation.State,
        countryCode: externalLocation['Country code'],
    };

    let translatedCongregationLocation = {
        congregationId,
        source,
        language: externalLocation.Language.toUpperCase(), // TODO create automanaged enumeration
        sourceLocationId: null,
        isPendingTerritoryMapping: 1,
        isDeleted: 0,
        isActive: 1,
        notes: externalLocation.Notes,
        userDefined1: externalLocation.Status,
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
        externalTerritoryId: externalLocation['Territory number'],
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
    const newLocations = differenceBy(updatedLocations, existingLocations, 'location.locationId');

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