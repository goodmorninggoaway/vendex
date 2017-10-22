const DAL = require('./dal');

// Use Heroku env variable, or let it create a connection with default values
// https://node-postgres.com/api/client
let connection;
if (process.env.DATABASE_URL) {
  connection = {
    connectionString: process.env.DATABASE_URL,
    debug: true,
  };
}

const knex = require('knex')({ connection, client: 'pg' });

DAL.initialize(knex);

module.exports = { DAL };
