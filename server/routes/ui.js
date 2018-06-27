exports.plugin = {
  register: async function (server, options) {
    const Controller = require('../controllers/ui');
    server.route([
      //{
      //  method: 'GET',
      //  path: '/login/{path*}',
      //  options: {
      //    async handler(req, res) {
      //      return res.spazy(req.url);
      //    },
      //  },
      //},
      {
        method: 'GET',
        path: '/{path*}',
        options: {
          async handler(req, res) {
            const { path } = req.params;
            return res.spazy(path);
          },
        },
      },
      //{
      //  method: 'GET',
      //  path: '/congregations/{congregationId}',
      //  options: Controller.getCongregation,
      //},
      //{
      //  method: 'POST',
      //  path: '/congregations/{congregationId}',
      //  options: Controller.updateCongregation,
      //},
      //{
      //  method: 'GET',
      //  path: '/congregations/{congregationId}/delete',
      //  options: Controller.deleteCongregation,
      //},
      //{
      //  method: 'GET',
      //  path: '/congregations',
      //  options: Controller.listCongregations,
      //},
      //{
      //  method: 'POST',
      //  path: '/congregations',
      //  options: Controller.createCongregation,
      //},
      //{
      //  method: 'GET',
      //  path: '/languages/{languageId}',
      //  options: Controller.getLanguage,
      //},
      //{
      //  method: 'POST',
      //  path: '/languages/{languageId}',
      //  options: Controller.updateLanguage,
      //},
      //{
      //  method: 'GET',
      //  path: '/languages/{languageId}/delete',
      //  options: Controller.deleteLanguage,
      //},
      //{ method: 'GET', path: '/languages', options: Controller.listLanguages },
      //{
      //  method: 'POST',
      //  path: '/languages',
      //  options: Controller.createLanguage,
      //},
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
      //{
      //  method: 'GET',
      //  path: '/alba/locations/{path?}',
      //  options: {
      //    handler: {
      //      view: {
      //        template: 'reactView.ejs',
      //        context: { componentName: 'AlbaLocationImportPage' },
      //      },
      //    },
      //  },
      //},
      //{
      //  method: 'GET',
      //  path: '/oas/locations/{path?}',
      //  options: {
      //    handler: {
      //      view: {
      //        template: 'reactView.ejs',
      //        context: { componentName: 'OASLocationImportPage' },
      //      },
      //    },
      //  },
      //},
      //{
      //  method: 'GET',
      //  path: '/territoryhelper/forward-conversion/{path?}',
      //  options: {
      //    handler: {
      //      view: {
      //        template: 'reactView.ejs',
      //        context: { componentName: 'TerritoryHelperForwardConversionPage' },
      //      },
      //    },
      //  },
      //},
      //{
      //  method: 'GET',
      //  path: '/territoryhelper/forward-conversion-history/{path?}',
      //  options: {
      //    handler: {
      //      view: {
      //        template: 'reactView.ejs',
      //        context: { componentName: 'TerritoryHelperForwardConversionHistoryPage' },
      //      },
      //    },
      //  },
      //},
      //{
      //  method: 'GET',
      //  path: '/users',
      //  options: {
      //    handler: {
      //      view: {
      //        template: 'reactView.ejs',
      //        context: { componentName: 'UserListPage' },
      //      },
      //    },
      //  },
      //},
      //{
      //  method: 'GET',
      //  path: '/login',
      //  options: {
      //    handler: {
      //      view: {
      //        template: 'reactView.ejs',
      //        context: { componentName: 'LoginPage' },
      //        options: { layout: 'homepageLayout' },
      //      },
      //    },
      //    auth: false,
      //  },
      //},
      //{
      //  method: 'GET',
      //  path: '/accept-invitation',
      //  options: {
      //    handler: {
      //      view: {
      //        template: 'reactView.ejs',
      //        context: { componentName: 'AcceptInvitationPage' },
      //        options: { layout: 'homepageLayout' },
      //      },
      //    },
      //    auth: false,
      //  },
      //},
      //{
      //  method: 'GET',
      //  path: '/accept-invitation/welcome',
      //  options: {
      //    handler: {
      //      view: {
      //        template: 'reactView.ejs',
      //        context: { componentName: 'AcceptInvitationSuccessPage' },
      //        options: { layout: 'homepageLayout' },
      //      },
      //    },
      //    auth: false,
      //  },
      //},
      //{
      //  method: 'GET',
      //  path: '/forgot-password',
      //  options: {
      //    handler: {
      //      view: {
      //        template: 'reactView.ejs',
      //        context: { componentName: 'ForgotPasswordPage' },
      //        options: { layout: 'homepageLayout' },
      //      },
      //    },
      //    auth: false,
      //  },
      //},
      //{
      //  method: 'GET',
      //  path: '/reset-password',
      //  options: {
      //    handler: {
      //      view: {
      //        template: 'reactView.ejs',
      //        context: { componentName: 'ResetPasswordPage' },
      //        options: { layout: 'homepageLayout' },
      //      },
      //    },
      //    auth: false,
      //  },
      //},
      //{
      //  method: 'GET',
      //  path: '/admin/congregations',
      //  options: {
      //    handler: {
      //      view: {
      //        template: 'reactView.ejs',
      //        context: { componentName: 'CongregationsPage' },
      //      },
      //    },
      //    auth: false,
      //  },
      //},
    ]);
  },
  version: require('../../package.json').version,
  name: 'ui-route',
};
