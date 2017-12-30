module.exports = {
  importLocations: {
    handler: async function (req, res) {
      const XLSX = require('xlsx');
      const wb = XLSX.read(req.payload.file);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const inputData = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const importLocations = require('../../../domain/import-territory-helper');
      importLocations({ congregationId: +req.headers.congregationid, fileStream: req.payload.file, sourceData: inputData });
      return null;
    },
    payload: {
      allow: 'multipart/form-data',
      parse: true,
    }
  },

  importTerritories: {
    handler: async function (req, res) {
      const importTerritories = require('../../../domain/territoryHelper/territories');
      await importTerritories({ congregationId: +req.headers.congregationid, inputData: req.payload.file });
      return null;
    },
    payload: {
      allow: 'multipart/form-data',
      parse: true,
      maxBytes: 2 * 2 ** 20, // 2 MiB
    }
  },

  exportLocations: {
    handler: async function (req, res) {
      const congregationId = req.headers.congregationid || req.query.congregationid;
      const tracer = require('uuid/v4')();
      const exportLocations = require('../../../domain/territoryHelper/export');
      exportLocations({ congregationId, tracer });

      return res.response()
        .location(`/ui/territoryhelper/exports/download?tracer=${tracer}`);
    },
  },
};

