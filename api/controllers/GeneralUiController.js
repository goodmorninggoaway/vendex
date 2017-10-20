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

  listLanguages: async function (req, res) {
    const languages = await DAL.getLanguages();
    return res.view('language/list', {
      languages: sortBy(languages, 'language'),
    });
  },

  createLanguage: async function (req, res) {
    await DAL.insertLanguage({
      language: req.body.language,
      synonyms: req.body.synonyms
        .replace('\r\n', '\n')
        .replace('\r', '\n')
        .split('\n')
        .map(x => x.trim()),
    });

    res.redirect('/ui/languages');
  },

  getLanguage: async function (req, res) {
    const languages = await DAL.findLanguageById({ languageId: parseInt(req.param('languageId')) });
    return res.view('language/edit', { language });
  },

  updateLanguage: async function (req, res) {
    const language = await DAL.updateLanguage(req.param('languageId'), {
      language: req.body.language,
      synonyms: req.body.synonyms,
    });

    res.redirect('/ui/languages');
  },

  deleteLanguage: async function (req, res) {
    await DAL.deleteLanguage(req.param('languageId'));
    res.redirect('/ui/languages');
  },
};

