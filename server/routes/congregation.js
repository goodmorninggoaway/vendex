exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/congregation');
    server.route([
      {
        method: 'GET',
        path: '/{congregationId}',
        options: Controller.getCongregation,
      },
      {
        method: 'POST',
        path: '/{congregationId}',
        options: Controller.updateCongregation,
      },
      {
        method: 'DELETE',
        path: '/{congregationId}',
        options: Controller.deleteCongregation,
      },
      {
        method: 'GET',
        path: '/',
        options: Controller.listCongregations,
      },
      {
        method: 'POST',
        path: '/',
        options: Controller.createCongregation,
      },
    ]);
  },
  version: require('../../package.json').version,
  name: 'congregation-route',
};
