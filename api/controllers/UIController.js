const sortBy = require('lodash/sortBy');
const { DAL } = require('../domain/dataAccess');

/**
 * GeneralUiController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

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
    const [congregation, languages, congregations] = await Promise.all([
      DAL.getCongregationWithIntegrations(req.param('congregationId')),
      DAL.getLanguages(),
      DAL.getCongregations(),
    ]);
    return res.view('congregation/edit', {
      congregation,
      congregations,
      languages: sortBy(languages, 'language'),
    });
  },

  updateCongregation: async function (req, res) {
    await DAL.updateCongregation(req.param('congregationId'), {
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
    const language = await DAL.findLanguageById(req.param('languageId'));
    return res.view('language/edit', { language });

    // TODO Stopped here ... problem wit this query
  },

  updateLanguage: async function (req, res) {
    const synonyms = (req.body.synonyms || '')
      .replace('\r\n', '\n')
      .replace('\r', '\n')
      .split('\n')
      .filter(x => x && x.length);
    await DAL.updateLanguage({ languageId: req.param('languageId') }, {
      synonyms,
      language: req.body.language,
    });

    res.redirect('/ui/languages');
  },

  deleteLanguage: async function (req, res) {
    await DAL.deleteLanguage(req.param('languageId'));
    res.redirect('/ui/languages');
  },

  addCongregationIntegration: async function (req, res) {
    const sourceCongregationId = Number(req.param('sourceCongregationId') || req.body.sourceCongregationId);
    const destinationCongregationId = Number(req.param('destinationCongregationId') || req.body.destinationCongregationId);
    const congregationId = req.param('congregationId') || req.body.destinationCongregationId;

    let language = req.param('language') || req.body.language;
    if (!language || language === '') {
      language = null;
    }

    await DAL.addCongregationIntegration({ sourceCongregationId, destinationCongregationId, language });
    res.redirect(`/ui/congregations/${congregationId}`);
  },

  deleteCongregationIntegration: async function (req, res) {
    const sourceCongregationId = req.param('sourceCongregationId') || req.body.sourceCongregationId;
    const destinationCongregationId = req.param('destinationCongregationId') || req.body.destinationCongregationId;
    const congregationId = req.param('congregationId') || req.body.congregationId || req.query.congregationid;
    let language = req.query.language;
    if (!language || language === '') {
      language = null;
    }
    await DAL.deleteCongregationIntegration({ sourceCongregationId, destinationCongregationId, language });
    res.redirect(`/ui/congregations/${congregationId}`);
  },

  resetDatabase: function (req, res) {
    DAL.reset()
      .then(() => res.ok())
      .catch((err) => res.serverError(err));
  },

  getTerritoryHelperExport: async function (req, res) {
    const { exportId: exportActivityId } = req.params;
    const exportActivity = await DAL.getLastExportActivity({ exportActivityId });
    return res.view('territoryHelper/viewExport', exportActivity);
  },

  getTerritoryHelperExportHistory: async function (req, res) {
    const { congregationid: congregationId } = req.query;
    const exports = (await DAL.getExportActivities({ congregationId }))
      .filter((e) => {
        // the summary was added later
        if (!e.summary) {
          return true;
        }

        const { inserts, updates, deletes } = e.summary;
        return inserts || deletes || updates;
      });

    return res.view('territoryHelper/exportLocations', { exports });
  },

  downloadTerritoryHelperExport: async function (req, res) {
    const exportActivityId = req.params.exportId;
    const key = req.query.tracer;

    const exportActivity = await DAL.getLastExportActivity({ exportActivityId, key });
    if (!exportActivity || !exportActivity.payload) {
      res.sendStatus(204);
    }

    const createExcelFile = require('../domain/territoryHelper/export/createExcelFile').handler;
    const file = await createExcelFile({ externalLocations: exportActivity.payload });
    if (!file) {
      return res.serverError('Error generating excel file');
    }

    const filename = `territoryhelper_${exportActivity.key}.xlsx`;
    res.attachment(filename);
    res.set('x-vendex-filename', filename);
    res.send(file);
  }
};

