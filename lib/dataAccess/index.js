const SQL = require('sql.js');
const fs = require('fs');
const DAL = require('./dal');

let db;

const initialize = (file) => {
    db = new SQL.Database(fs.readFileSync(file));

    DAL.initialize(db, commit.bind(this, file));
};

const commit = (file) => {
    fs.writeFileSync(file, new Buffer(db.export()));
};

module.exports = { initialize, commit, DAL };

