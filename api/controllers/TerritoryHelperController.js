/**
 * TerritoryHelperController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

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
    await TerritoryHelperService.importTerritories({ congregationId: congregationid, inputData: req.body }, (err, data) => {
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
    const { congregationid, accept } = req.headers;
    const wantsFile = !accept
      || accept.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      || accept.includes('application/vnd.ms-excel');

    await TerritoryHelperService.exportLocations({ congregationId: congregationid, wantsFile }, (err, data) => {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      }

      if (!wantsFile) {
        return res.json(data);
      } else {
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.set('content-disposition', `attachment; filename=territory_helper_${Date.now().valueOf()}.xlsx`);
        res.send(data);
      }
    });
  },

};

