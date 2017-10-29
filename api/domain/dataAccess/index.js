const { Model } = require('objection');
const DAL = require('./dal');

// Use Heroku env variable, or let it create a connection with default values
// https://node-postgres.com/api/client
let connection;
if (process.env.DATABASE_URL) {
  connection = { connectionString: process.env.DATABASE_URL };
}

const knex = require('knex')({ connection, client: 'pg', debug: process.env.DATABASE_DEBUG });

DAL.initialize(knex);
Model.knex(knex);

module.exports = { DAL };
