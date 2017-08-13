const SQL = require('sql.js');
const jsonSql = require('json-sql')({ dialect: 'sqlite' });
const mapKeys = require('lodash/mapKeys');

let db;

const initialize = (_db) => {
    db = _db;
};

const select = ({ filter, columns, table }) => {
    // const whereClause = Object.keys(filter).reduce((memo, key, index) => {
    //     if (index) {
    //         memo += ' and ';
    //     }
    //
    //     memo += `${key} = :${key}`;
    //     return memo;
    // }, '');
    //
    // const params = Object.entries(filter).reduce((memo, [key, value]) => ({ ...memo, [`:${key}`]: value }));
    //
    // const sql = `select ${columns || '*'} from ${table} where ${whereClause}`;

    const sql = jsonSql.build({
        table,
        fields: columns,
        condition: filter,
        type: 'select',
    });

    const statement = db.prepare(sql.query);

    const result = statement.getAsObject(sql.values);
    const results = [];

    if (Object.keys(result).length) {
        results.push(result);
    }

    while (statement.step()) {
        results.push(statement.getAsObject());
    }

    statement.free();
    return results;
};

const selectFirstOrDefault = (...args) => {
    const result = select(...args);
    return result.length ? result : null;
};

const insert = ({ values, table, idColumn }) => {
    const sql = jsonSql.build({
        table,
        values,
        type: 'insert',
    });

    db.run(sql.query, mapKeys(sql.getValuesObject(), (value, key) => `$${key}`));

    const statement = db.prepare('SELECT last_insert_rowid() AS id;');
    const { id } = statement.getAsObject();
    console.log(idColumn, id);
    statement.free();

    return idColumn ? { ...values, [idColumn]: id } : values;
};

const findCongregation = (filter) => selectFirstOrDefault({ filter, table: 'congregation' });
const insertCongregation = (values) => insert({ values, table: 'congregation', idColumn: 'congregationId' });
const findLocation = (filter) => selectFirstOrDefault({ filter, table: 'location' });
const insertLocation = (values) => insert({ values, table: 'location', idColumn: 'locationId' });
const findCongregationLocation = (filter) => selectFirstOrDefault({ filter, table: 'congregationLocation' });
const insertCongregationLocation = (values) => insert({
    values,
    table: 'congregationlocation',
    idColumn: 'locationId'
});

module.exports = {
    initialize,
    findCongregationLocation,
    findLocation,
    insertLocation,
    insertCongregationLocation,
    findCongregation,
    insertCongregation,
};


