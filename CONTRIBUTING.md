# Contributing

## Getting Started
1. Install git
1. Install NodeJS >= 8.x
1. Install npm >= 5.5.x
1. Install PostgreSQL >= 9.x. 
   - Create a SUPERUSER
   - Create a new database. I'll call it `vendex` here:
    ```
    psql -d postgres -f scripts/createdb.sql
    ```
1. Clone the repository: `git clone git@github.com:goodmorninggoaway/vendex.git`
   - https://help.github.com/articles/connecting-to-github-with-ssh/
1. `cd ~/vendex`
1. Add a file named `.env` to store app settings. DO NOT COMMIT this file.
```
PORT=1337
GOOGLE_API_KEY=<-- PRIVATE -->
MAX_CONCURRENCY=4
DATABASE_DEBUG=true
DATABASE_URL=postgres://vendex:vendex@localhost:5432/vendex
APP_ENV=DEV
```
1. Install dependencies: `npm install`
1. Start the server: `npm start`

## TODO
[ ] Dockerize
