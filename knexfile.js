module.exports = {
  client: 'pg',
  connection:
    process.env.DATABASE_URL ||
    'postgres://vendex:vendex@localhost:5432/vendex_test',
  migrations: {
    directory: './api/domain/dataAccess/migrations',
  },
  seeds: {
    directory: './api/domain/dataAccess/seeds',
  },
};
