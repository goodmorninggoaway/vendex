module.exports = {

  /**
   * `TerritoryHelperController.importLocations()`
   */
  importLocations: function (req, res) {
    const { congregationid } = req.headers;

    req.file('file').upload({ maxBytes: process.env.FILE_UPLOAD_MAX_BYTES }, (err, files) => {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      }

      if (!files.length) {
        return res.badRequest('Missing required "file" parameter; must be a file upload.');
      }

      TerritoryHelperService.importLocations({ congregationId: congregationid, file: files[0].fd }, (err, data) => {
        if (err) {
          sails.log.error(err);
          return res.serverError(err);
        }

        return res.json(data);
      });
    });
  },

  /**
   * `TerritoryHelperController.importTerritories()`
   */
  importTerritories: async function (req, res) {
    const { congregationid } = req.headers;
    await TerritoryHelperService.importTerritories({ congregationId: Number(congregationid), inputData: req.body }, (err, data) => {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      }

      return res.json(data);
    });
  },

  /**
   * `TerritoryHelperController.export()`
   */
  exportLocations: async function (req, res) {
    const { accept } = req.headers;
    const wantsFile = !accept
      || accept.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      || accept.includes('application/vnd.ms-excel')
      || req.query.format === 'xls'
      || req.query.format === 'xlsx';

    const congregationId = req.headers.congregationid || req.query.congregationid;
    const tracer = require('uuid/v4')();

    await TerritoryHelperService.exportLocations({ congregationId, tracer }, (err) => {
      if (err) {
        sails.log.error(err);
      }
    });

    res.location(`/ui/territoryhelper/exports/download?tracer=${tracer}`);
    res.ok();
  },

};

