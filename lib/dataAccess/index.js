const SQL = require('sql.js');
const fs = require('fs');
const DAL = require('./dal');

let db;

const initialize = (file) => {
    db = new SQL.Database(fs.readFileSync(file));

    DAL.initialize(db);
};

const commit = (file) => {
    console.log('jhre');
    fs.writeFileSync(file, new Buffer(db.export()));
};

module.exports = { initialize, commit, DAL };

