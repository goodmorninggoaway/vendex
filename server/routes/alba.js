exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/alba');
    server.route([
      {
        method: 'POST',
        path: '/locations',
        options: Controller.importLocations,
      },
      { method: 'POST', path: '/session', options: Controller.createSession },
      { method: 'GET', path: '/session', options: Controller.getOpenSessions },
      { method: 'POST', path: '/session/locations/{locationId}/process', options: Controller.importLocation },
      { method: 'POST', path: '/location-import/analyze', options: Controller.preprocessAnalysis },
    ]);
  },
  version: require('../../package.json').version,
  name: 'alba-route',
};
