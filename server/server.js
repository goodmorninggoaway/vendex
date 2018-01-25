require('dotenv').config();
process.env.APP_ENV = process.env.APP_ENV || 'PROD';

require('babel-core/register')({
  extensions: '.jsx',
});

const Glue = require('glue');
const serverConfig = require('./manifest');

const startServer = async function() {
  try {
    const options = { ...serverConfig.options, relativeTo: __dirname };
    const server = await Glue.compose(serverConfig.manifest, options);

    server.auth.strategy('jwt', 'jwt', {
      key: 'NeverShareYourSecret', // Never Share your secret key
      validate() {
        return true;
      },
      verifyOptions: { algorithms: ['HS256'] }, // pick a strong algorithm
    });

    // server.auth.default('jwt');

    await server.start();
    console.log('server started');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
