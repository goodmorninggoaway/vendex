exports.plugin = {
  async register(server, options) {
    const Controller = require('../controllers/ui');
    server.route([
      { method: 'GET', path: '/', options: Controller.homepage },
      {
        method: 'GET',
        path: '/congregations/{congregationId}',
        options: Controller.getCongregation,
      },
      {
        method: 'POST',
        path: '/congregations/{congregationId}',
        options: Controller.updateCongregation,
      },
      {
        method: 'GET',
        path: '/congregations/{congregationId}/delete',
        options: Controller.deleteCongregation,
      },
      {
        method: 'GET',
        path: '/congregations',
        options: Controller.listCongregations,
      },
      {
        method: 'POST',
        path: '/congregations',
        options: Controller.createCongregation,
      },
      {
        method: 'POST',
        path: '/congregationintegrations',
        options: Controller.addCongregationIntegration,
      },
      {
        method: 'GET',
        path:
          '/congregationintegrations/{sourceCongregationId}/{destinationCongregationId}/delete',
        options: Controller.deleteCongregationIntegration,
      },
      {
        method: 'GET',
        path: '/languages/{languageId}',
        options: Controller.getLanguage,
      },
      {
        method: 'POST',
        path: '/languages/{languageId}',
        options: Controller.updateLanguage,
      },
      {
        method: 'GET',
        path: '/languages/{languageId}/delete',
        options: Controller.deleteLanguage,
      },
      { method: 'GET', path: '/languages', options: Controller.listLanguages },
      {
        method: 'POST',
        path: '/languages',
        options: Controller.createLanguage,
      },
      {
        method: 'GET',
        path: '/territoryhelper/exports',
        options: Controller.getTerritoryHelperExportHistory,
      },
      {
        method: 'GET',
        path: '/territoryhelper/exports/download',
        options: Controller.downloadTerritoryHelperExport,
      },
      {
        method: 'GET',
        path: '/territoryhelper/exports/{exportId}/download',
        options: Controller.downloadTerritoryHelperExport,
      },
      {
        method: 'GET',
        path: '/territoryhelper/exports/{exportId}',
        options: Controller.getTerritoryHelperExport,
      },
      { method: 'DELETE', path: '/reset', options: Controller.resetDatabase },
      {
        method: 'GET',
        path: '/reset',
        options: { handler: { view: { template: 'general/reset.ejs' } } },
      },
      {
        method: 'GET',
        path: '/alba/locations',
        options: {
          handler: { view: { template: 'alba/importLocations.ejs' } },
        },
      },
      {
        method: 'GET',
        path: '/territoryhelper/locations',
        options: {
          handler: {
            view: { template: 'territoryHelper/importLocations.ejs' },
          },
        },
      },
      {
        method: 'GET',
        path: '/territoryhelper/territories',
        options: {
          handler: {
            view: { template: 'territoryHelper/importTerritories.ejs' },
          },
        },
      },
      {
        method: 'GET',
        path: '/users',
        options: {
          handler: {
            view: {
              template: 'reactView.ejs',
              context: { componentName: 'UserList', props: {} },
            },
          },
        },
      },
      {
        method: 'GET',
        path: '/login',
        options: {
          handler: {
            view: {
              template: 'auth/login.ejs',
              options: { layout: 'homepageLayout' },
            },
          },
        },
      },
    ]);
  },
  version: require('../../package.json').version,
  name: 'ui-route',
};
