/**
 * - Read input file
 * - Convert to JSON
 * - Convert into THALBA format
 * - Apply rules
 */
console.log('loading options');
const { congregationId, file, source } = require('../options');
console.log('loaded options', require('../options'));

const util = require('util');
const excelAsJson = require('excel-as-json');
const geocode = require('../geocode');
const { DAL } = require('../dataAccess');
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

const importLocation = async (externalLocation) => {
    const geocoded = await geocode(externalLocation.Address);
    let location = {
        addressLine1: externalLocation.Number,
        addressLine2: externalLocation.Address,
        street: externalLocation.Street,
        city: externalLocation.City,
        postalCode: externalLocation['Postal code'],
        province: externalLocation.State,
        countryCode: externalLocation['Country code'],
        ...geocoded,
    };

    let congregationLocation = {
        congregationId,
        languageId: 1, // TODO get correct language
        source: 'TERRITORY HELPER',
        sourceLocationId: null,
        isPendingTerritoryMapping: 1,
        isDeleted: 0,
        isActive: 1,
        notes: externalLocation.Notes,
        userDefined1: externalLocation.Status,
    };

    const { externalLocationId } = geocoded;
    console.log(externalLocationId);
    const existingLocation = await DAL.findLocation({ externalLocationId });

    if (existingLocation) {
        const { locationId } = existingLocation;
        const { congregationId } = congregationLocation;

        const existingCongregationLocation = await DAL.findCongregationLocation({ locationId, congregationId });
        if (existingCongregationLocation) {
            // TODO make sure the status is the same or update it
        } else {
            congregationLocation = await DAL.insertCongregationLocation({
                ...congregationLocation,
                locationId,
            });
        }
    } else {
        location = await DAL.insertLocation(location);
        congregationLocation = await DAL.insertCongregationLocation({
            ...congregationLocation,
            locationId: location.locationId
        });
    }

    return { location, congregationLocation };
};

const doStuff = async () => {
    const sourceData = (await loadFile(file)).slice(0, 2);
    return await Promise.all(sourceData.map(importLocation));
};

doStuff()
    .then(x => console.log(x))
    .then(x => process.exit(0))
    .catch(x => {
        console.error(x);
        process.exit(1);
    });