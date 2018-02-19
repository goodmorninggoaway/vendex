require('dotenv').config();
const Pick = require('lodash/pick');
const Yargs = require('yargs');
const { User } = require('../domain/models');

const { argv } = Yargs.array('roles')
  .options({
    userId: {
      alias: ['u', 'userid'],
      demandOption: true,
      describe: 'User ID',
      type: 'number',
    },
    ttl: {
      alias: 't',
      default: 15,
      describe:
        'Time to Live (TTL) in minutes. Prefer a shorter timeout for production environments.',
      type: 'number',
    },
  })
  .showHelpOnFail();

const claims = Pick(argv, 'roles', 'congregationId', 'email');
User.generateJWT(argv.userId, claims, argv.ttl)
  .then(console.log)
  .catch(console.error);
