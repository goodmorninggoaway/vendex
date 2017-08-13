const SQL = require('sql.js');
const fs = require('fs');
const DAL = require('./dal');

let db;

const initialize = (file) => {
    const filebuffer = fs.readFileSync(file);
    db = new SQL.Database(filebuffer);

    DAL.initialize(db);
};

module.exports = { initialize, DAL };

