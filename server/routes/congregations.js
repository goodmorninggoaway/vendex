exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/congregations');

    server.register([{ plugin: require('schwifty') }]);

    server.route([
      { method: 'GET', path: '/', options: Controller.listCongregations }
    ]);
  },
  version: require('../../package.json').version,
  name: 'congregations-route',
};
