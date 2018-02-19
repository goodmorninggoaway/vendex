require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: './domain/dataAccess/migrations',
  },
  seeds: {
    directory: './domain/dataAccess/seeds',
  },
};
