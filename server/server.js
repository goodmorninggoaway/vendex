require('dotenv').config();
process.env.APP_ENV = process.env.APP_ENV || 'PROD';

require('babel-core/register')({
  extensions: '.jsx',
});

const Glue = require('@hapi/glue');
const serverConfig = require('./manifest');

const startServer = async function() {
  try {
    const options = { ...serverConfig.options, relativeTo: __dirname };
    const server = await Glue.compose(serverConfig.manifest, options);
    await server.start();
    console.log('server started');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
