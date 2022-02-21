require("dotenv").config();
let connection;
if (process.env.DATABASE_URL) {
  connection = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL !== "false" && !!process.env.DATABASE_SSL ? {
      rejectUnauthorized: false
    } : false
  };
}

module.exports = {
  client: "pg",
  connection,
  migrations: {
    directory: "./domain/dataAccess/migrations"
  },
  seeds: {
    directory: "./domain/dataAccess/seeds"
  }
};
