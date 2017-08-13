/**
 * - Read input file
 * - Convert to JSON
 * - Convert into THALBA format
 * - Apply rules
 */

const fs = require('fs');
const util = require('util');
const excelAsJson = require('excel-as-json');
const geocode = require('../geocode');
const { DAL, initialize, commit } = require('../dataAccess');

const open = util.promisify(fs.open);
const convertExcelToJson = util.promisify(excelAsJson.processFile);

const { congregationId, file, source } = require('../options');

if (source !== 'TERRITORY HELPER') {
    throw new Error('Invalid source for this interface')
}

initialize(process.env.DB_FILENAME);

const loadFile = async (file) => {
    await open(file, 'r');
    return await convertExcelToJson(file, null, {});
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
                isDeleted: 0,
                isActive: 1,
                notes: externalLocation.Notes,
                userDefined1: externalLocation.Status,
            },
        };

    };

const convertExternal = ({ externalLocation, congregationId, languageId }) =>
    geocode(externalLocation.Address)
        .then(importMapper({ congregationId, languageId, isPendingTerritoryMapping: 1, externalLocation }));


const importLocation = ({ location, congregationLocation }) => {
    const { externalLocationId } = location;
    const existingLocation = DAL.findLocation({ externalLocationId });

    if (existingLocation) {
        const { locationId } = existingLocation;
        const { congregationId } = congregationLocation;

        const existingCongregationLocation = DAL.findCongregationLocation({ locationId, congregationId });
        if (existingCongregationLocation) {
            // TODO make sure the status is the same or update it
        } else {
            congregationLocation = DAL.insertCongregationLocation({
                congregationLocation,
                locationId,
            });
        }
    } else {
        location = DAL.insertLocation(location);
        console.log(location.locationId);
        congregationLocation = DAL.insertCongregationLocation({
            ...congregationLocation,
            locationId: location.locationId
        });
    }

    return { location, congregationLocation };
};

module.exports = { importLocation };
const doStuff = async () => {
    const sourceData = await loadFile(file);

    const converted = await Promise.all(sourceData.map(
        async externalLocation => {
            const converted = await convertExternal({ congregationId, languageId: 1, externalLocation });
            const inserted = importLocation(converted);
            return inserted;
        }
    ));
};

doStuff()
    .then(() => commit(process.env.DB_FILENAME))
    .catch(console.error);