const SQL = require('sql.js');
const jsonSql = require('json-sql')({ dialect: 'sqlite' });

let db;

const initialize = (_db) => {
    db = _db;
};

const select = ({ filter, columns, table }) => {
    const whereClause = Object.keys(filter).reduce((memo, key) => {
        if (index) {
            memo += ' and ';
        }

        memo += `${key} = :${key}`;
        return memo;
    }, '');

    const params = Object.entries(filter).reduce((memo, [key, value]) => ({ ...memo, [`:${key}`]: value }));

    const sql = `select ${columns || '*'} from ${table} where ${whereClause}`;
    const statement = db.prepare(sql);
    const result = statement.getAsObject(params);

    statement.free();

    return result;
};

const insert = ({ values, table, idColumn }) => {
    const sql = jsonSql.build({
        table,
        values,
        type: 'insert',
    }) + '; SELECT last_insert_rowid() AS id;';

    const statement = db.prepare(sql);
    const { id } = statement.getAsObject(params);
    statement.free();

    return idColumn ? { ...values, [idColumn]: id } : values;
};

const findLocation = (filter) => select({ filter, table: 'location' });
const insertLocation = (values) => insert({ values, table: 'location', idColumn: 'locationId' });
const findCongregationLocation = (filter) => select({ filter, table: 'congregationLocation' });
const insertCongregationLocation = (values) => insert({
    values,
    table: 'congregationlocation',
    idColumn: 'locationId'
});

module.exports = { initialize, findCongregationLocation, findLocation, insertLocation, insertCongregationLocation, };

