# Contributing

## Getting Started
1. Install git
1. Install NodeJS >= 8.x
1. Install npm >= 5.5.x
1. Install PostgreSQL >= 9.x.
1. Create a new database. `./scripts/createDevDb.sh`
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
SECRET=<GENERATE A SECRET>
TOKEN_EXPIRATION_MINUTES=60
USE_SSL=false
MAILGUN_API_KEY=<-- PRIVATE -->
MAILGUN_DOMAIN=<-- PRIVATE -->
MAILGUN_FROM=My Name <some email address>
UI_BASE_URL=http://localhost:1337/ui
#DEBUG_NOTIFICATION_TO_EMAIL=My Name <some email address>

```

Easy way to generate a secret:
`node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"`
1. Install dependencies: `npm install`
1. Start the server: `npm start`

If you're using a NodeJS debugger, use the `server:debug` script.

## Deploying
Deployments are automated based on the branch:
`master` -> dev
`production` -> prod

## Versioning
Use npm to tag versions: `npm version patch|minor && git push && git push --tags`
