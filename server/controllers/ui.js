const Boom = require('boom');
const sortBy = require('lodash/sortBy');
const DAL = require('../../domain/dataAccess').DAL;

const handlers = {
  homepage: async function(req, res) {
    const congregations = await DAL.getCongregations();
    return res.view('homepage.ejs', { congregations });
  },

  listCongregations: async function(req, res) {
    const [congregations, languages] = await Promise.all([
      DAL.getCongregations(),
      DAL.getLanguages(),
    ]);
    return res.view('congregation/list.ejs', {
      congregations: sortBy(congregations, 'name'),
      languages: sortBy(languages, 'language'),
    });
  },

  createCongregation: async function(req, res) {
    const congregation = await DAL.insertCongregation({
      name: req.payload.name,
      language: req.payload.language,
    });

    return res.redirect('/ui/congregations');
  },

  getCongregation: async function(req, res) {
    const [congregation, languages, congregations] = await Promise.all([
      DAL.getCongregationWithIntegrations(req.params.congregationId),
      DAL.getLanguages(),
      DAL.getCongregations(),
    ]);
    return res.view('congregation/edit.ejs', {
      congregation,
      congregations,
      languages: sortBy(languages, 'language'),
    });
  },

  updateCongregation: async function(req, res) {
    await DAL.updateCongregation(req.params.congregationId, {
      name: req.payload.name,
      language: req.payload.language,
    });

    return res.redirect('/ui/congregations');
  },

  deleteCongregation: async function(req, res) {
    const congregation = await DAL.deleteCongregation(
      req.params.congregationId,
    );
    return res.redirect('/ui/congregations');
  },

  listLanguages: async function(req, res) {
    const languages = await DAL.getLanguages();
    return res.view('language/list.ejs', {
      languages: sortBy(languages, 'language'),
    });
  },

  createLanguage: async function(req, res) {
    await DAL.insertLanguage({
      language: req.payload.language,
      synonyms: req.payload.synonyms
        .replace('\r\n', '\n')
        .replace('\r', '\n')
        .split('\n')
        .map(x => x.trim()),
    });

    return res.redirect('/ui/languages');
  },

  getLanguage: async function(req, res) {
    const language = await DAL.findLanguageById(req.params.languageId);
    return res.view('language/edit.ejs', { language });
  },

  updateLanguage: async function(req, res) {
    const synonyms = (req.payload.synonyms || '')
      .replace('\r\n', '\n')
      .replace('\r', '\n')
      .split('\n')
      .filter(x => x && x.length);
    await DAL.updateLanguage(
      { languageId: req.params.languageId },
      {
        synonyms,
        language: req.payload.language,
      },
    );

    return res.redirect('/ui/languages');
  },

  deleteLanguage: async function(req, res) {
    await DAL.deleteLanguage(req.params.languageId);
    return res.redirect('/ui/languages');
  },

  addCongregationIntegration: async function(req, res) {
    const sourceCongregationId = Number(
      req.params.sourceCongregationId || req.payload.sourceCongregationId,
    );
    const destinationCongregationId = Number(
      req.params.destinationCongregationId ||
        req.payload.destinationCongregationId,
    );
    const congregationId =
      req.params.congregationId || req.payload.destinationCongregationId;

    let language = req.params.language || req.payload.language;
    if (!language || language === '') {
      language = null;
    }

    await DAL.addCongregationIntegration({
      sourceCongregationId,
      destinationCongregationId,
      language,
    });
    return res.redirect(`/ui/congregations/${congregationId}`);
  },

  deleteCongregationIntegration: async function(req, res) {
    const sourceCongregationId =
      req.params.sourceCongregationId || req.payload.sourceCongregationId;
    const destinationCongregationId =
      req.params.destinationCongregationId ||
      req.payload.destinationCongregationId;
    const congregationId =
      req.params.congregationId ||
      (req.payload && req.payload.congregationId) ||
      req.query.congregationid;
    let language = req.query.language;
    if (!language || language === '') {
      language = null;
    }
    await DAL.deleteCongregationIntegration({
      sourceCongregationId,
      destinationCongregationId,
      language,
    });
    return res.redirect(`/ui/congregations/${congregationId}`);
  },

  resetDatabase: async function(req, res) {
    if (process.env.APP_ENV !== 'PROD') {
      return DAL.reset();
    }

    return Boom.badRequest();
  },

  getTerritoryHelperExport: async function(req, res) {
    const { exportId: exportActivityId } = req.params;
    const exportActivity = await DAL.getLastExportActivity({
      exportActivityId,
    });
    return res.view('territoryHelper/viewExport.ejs', exportActivity);
  },

  getTerritoryHelperExportHistory: async function(req, res) {
    const { congregationid: congregationId } = req.query;
    const exports = (await DAL.getExportActivities({ congregationId })).filter(
      e => {
        // the summary was added later
        if (!e.summary) {
          return true;
        }

        const { inserts, updates, deletes } = e.summary;
        return inserts || deletes || updates;
      },
    );

    return res.view('territoryHelper/exportLocations.ejs', { exports });
  },

  downloadTerritoryHelperExport: async function(req, res) {
    const exportActivityId = req.params.exportId;
    const key = req.query.tracer;

    const exportActivity = await DAL.getLastExportActivity({
      exportActivityId,
      key,
    });
    if (!exportActivity || !exportActivity.payload) {
      return res.response().code(204);
    }

    // Older version was nested and much fatter
    const { inserts, deletes, updates } = exportActivity.payload;
    const payload = {
      inserts: inserts ? inserts.map(x => x.externalLocation || x) : undefined,
      updates: updates ? updates.map(x => x.externalLocation || x) : undefined,
      deletes: deletes ? deletes.map(x => x.externalLocation || x) : undefined,
    };

    const createExcelFile = require('../../domain/territoryHelper/export/createExcelFile')
      .handler;
    const file = await createExcelFile(payload);
    if (!file) {
      return Boom.badData('Error generating excel file');
    }

    const filename = `territoryhelper_${exportActivity.key}.xlsx`;
    return res
      .response(file)
      .header('x-vendex-filename', filename)
      .header('Content-Disposition', `attachment; filename=${filename}`)
      .bytes(file.length);
  },
};

Object.entries(handlers).forEach(([key, handler]) => {
  exports[key] = { handler };
});
