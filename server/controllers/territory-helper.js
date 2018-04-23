const XLSX = require('xlsx');
const uuid = require('uuid/v4');
const Boom = require('boom');
const importLocations = require('../../domain/import-territory-helper');
const importTerritories = require('../../domain/territoryHelper/territories');
const exportLocations = require('../../domain/territoryHelper/export');

module.exports = {
  importLocations: {
    handler: async function (req, res) {
      const wb = XLSX.read(req.payload.file);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const inputData = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const { congregationId } = req.auth.credentials;

      importLocations({
        congregationId,
        fileStream: req.payload.file,
        sourceData: inputData,
      });
      return null;
    },
    payload: {
      allow: 'multipart/form-data',
      parse: true,
    },
  },

  importTerritories: {
    handler: async function (req) {
      const { congregationId } = req.auth.credentials;
      if (!req.payload.file) {
        return Boom.badRequest('A file is required.');
      }

      await importTerritories({
        congregationId,
        inputData: req.payload.file,
      });

      return null;
    },
    payload: {
      allow: 'multipart/form-data',
      parse: true,
      maxBytes: 2 * 2 ** 20, // 2 MiB
    },
  },

  exportLocations: {
    handler: async function (req, res) {
      const { congregationId } = req.auth.credentials;
      const tracer = uuid();

      exportLocations({ congregationId, tracer });

      return res
        .response()
        .location(`/ui/territoryhelper/exports/download?tracer=${tracer}`);
    },
  },
};
