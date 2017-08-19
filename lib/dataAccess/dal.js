const keyBy = require('lodash/keyBy');
const property = require('lodash/property');

let db;

module.exports.initialize = (_db) => {
    db = _db;
};

const select = async ({ filter, columns, table }) => {
    return await db.from(table).where(filter).select(columns);
};

const selectFirstOrDefault = async (...args) => {
    const result = await select(...args);
    return result.length ? result[0] : null;
};

const insert = async ({ values, table, idColumn }) => {
    if (idColumn) {
        const [id] = await db(table).insert(values).returning(idColumn);
        return { ...values, [idColumn]: id };
    }

    return await db(table).insert(values);
};

const update = async ({ filter, update, table }) => {
    return await db(table).where(filter).update(update);
};

module.exports.findCongregation = async (filter) => await selectFirstOrDefault({ filter, table: 'congregation' });
module.exports.insertCongregation = async (values) => await insert({
    values,
    table: 'congregation',
    idColumn: 'congregationId'
});
module.exports.findLocation = async (filter) => await selectFirstOrDefault({ filter, table: 'location' });
module.exports.insertLocation = async (values) => await insert({ values, table: 'location', idColumn: 'locationId' });
module.exports.findCongregationLocation = async (filter) => await selectFirstOrDefault({
    filter,
    table: 'congregationLocation'
});
module.exports.updateCongregationLocation = async (congregationId, locationId, value) => await update({
    filter: { congregationId, locationId },
    update: value,
    table: 'congregationLocation'
});

module.exports.insertCongregationLocation = async (values) => await insert({
    values,
    table: 'congregationLocation',
});

module.exports.deleteCongregationLocation = async (filter) => await db('congregationLocation').where(filter).del();

module.exports.findGeocodeResponse = async (filter) => await selectFirstOrDefault({ filter, table: 'geocodeResponse' });
module.exports.insertGeocodeResponse = async (values) => await insert({
    values,
    table: 'geocodeResponse',
    idColumn: 'geocodeResponseId'
});

module.exports.findTerritory = async (filter) => await selectFirstOrDefault({ filter, table: 'territory' });
module.exports.findTerritoryContainingPoint = (congregationId, { longitude, latitude }) => (
    db('territory').whereRaw('congregationId = ? and boundary @> point \'(?, ?)\'', [congregationId, longitude, latitude])
);
module.exports.insertTerritory = async (values) => await insert({ values, table: 'territory', idColumn: 'territoryId' });

module.exports.getLocationsForCongregation = async (congregationId) => {
    const locationsPromise = db.from('location')
        .innerJoin('congregationLocation', 'location.locationId', 'congregationLocation.locationId')
        .where({ congregationId })
        .select('location.*');

    const congregationLocationsPromise = db.from('congregationLocation').where({ congregationId }).select();

    const [locations, congregationLocations] = await Promise.all([locationsPromise, congregationLocationsPromise]);
    const indexedCL = keyBy(congregationLocations, property('locationId'));

    return locations.map(location => ({ location, congregationLocation: indexedCL[location.locationId] }));
};

module.exports.addCongregationLocationActivity = async (values) => await insert({
    values,
    idColumn: 'congregationLocationActivityId',
    table: 'congregationLocationActivity',
});
