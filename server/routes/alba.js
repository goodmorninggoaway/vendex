exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/alba');
    server.route([
      {
        method: 'POST',
        path: '/{source}/locations',
        options: Controller.importLocations,
      },
      { method: 'POST', path: '/{source}/session', options: Controller.createSession },
      { method: 'GET', path: '/{source}/session', options: Controller.getOpenSessions },
      { method: 'POST', path: '/{source}/location-import/{locationId}/process', options: Controller.importLocation },
      { method: 'POST', path: '/{source}/location-import/analyze', options: Controller.preprocessAnalysis },
      { method: 'POST', path: '/{source}/location-import/finish', options: Controller.postprocessAnalysis },

      { method: 'GET', path: '/integrations', options: Controller.getIntegrations },
      { method: 'POST', path: '/integrations', options: Controller.addIntegration },
      { method: 'DELETE', path: '/integrations/{albaIntegrationId}', options: Controller.deleteIntegration },
    ]);
  },
  version: require('../../package.json').version,
  name: 'alba-route',
};
