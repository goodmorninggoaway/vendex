const sortBy = require('lodash/sortBy');
const { DAL } = require('../domain/dataAccess');

/**
 * GeneralUiController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  /**
   * `AlbaUIController.importLocations()`
   */
  resetDatabase: function (req, res) {
    return res.view('general/reset');
  },

  listCongregations: async function (req, res) {
    const [congregations, languages] = await Promise.all([DAL.getCongregations(), DAL.getLanguages()]);
    return res.view('congregation/list', {
      congregations: sortBy(congregations, 'name'),
      languages: sortBy(languages, 'language'),
    });
  },

  createCongregation: async function (req, res) {
    const congregation = await DAL.insertCongregation({
      name: req.body.name,
      language: req.body.language,
    });

    res.redirect('/ui/congregations');
  },

  getCongregation: async function (req, res) {
    const [congregation, languages] = await Promise.all([DAL.findCongregation({ congregationId: req.param('congregationId') }), DAL.getLanguages()]);
    return res.view('congregation/edit', {
      congregation,
      languages: sortBy(languages, 'language'),
    });
  },

  updateCongregation: async function (req, res) {
    const congregation = await DAL.updateCongregation(req.param('congregationId'), {
      name: req.body.name,
      language: req.body.language,
    });

    res.redirect('/ui/congregations');
  },

  deleteCongregation: async function (req, res) {
    const congregation = await DAL.deleteCongregation(req.param('congregationId'));
    res.redirect('/ui/congregations');
  },
};

