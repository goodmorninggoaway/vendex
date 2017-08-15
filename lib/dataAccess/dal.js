let db;

const initialize = (_db) => {
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
    const id = await db(table).insert(values);
    return idColumn ? { ...values, [idColumn]: id } : values;
};

const findCongregation = async (filter) => await selectFirstOrDefault({ filter, table: 'congregation' });
const insertCongregation = async (values) => await insert({
    values,
    table: 'congregation',
    idColumn: 'congregationId'
});
const findLocation = async (filter) => await selectFirstOrDefault({ filter, table: 'location' });
const insertLocation = async (values) => await insert({ values, table: 'location', idColumn: 'locationId' });
const findCongregationLocation = async (filter) => await selectFirstOrDefault({
    filter,
    table: 'congregationLocation'
});
const insertCongregationLocation = async (values) => await insert({
    values,
    table: 'congregationLocation',
});
const findGeocodeResponse = async (filter) => await selectFirstOrDefault({ filter, table: 'geocodeResponse' });
const insertGeocodeResponse = async (values) => await insert({
    values,
    table: 'geocodeResponse',
    idColumn: 'geocodeResponseId'
});

module.exports = {
    initialize,
    findCongregationLocation,
    findLocation,
    insertLocation,
    insertCongregationLocation,
    findCongregation,
    insertCongregation,
    findGeocodeResponse,
    insertGeocodeResponse,
};


