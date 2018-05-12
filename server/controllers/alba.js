const Boom = require('boom');
const importLocations = require('../../domain/alba/import');
const { handler: csvToJson } = require('../../domain/alba/import/convertCsvToJson');
const LOCATION_INTERFACES = require('../../domain/models/enums/locationInterfaces');

module.exports = {
  importLocations: {
    handler: async function (req) {
      const { congregationId } = req.auth.credentials;
      const { source = LOCATION_INTERFACES.ALBA } = req.params;
      return importLocations({ congregationId, source, inputData: req.payload });
    },
  },

  createSession: {
    async handler(req) {
      try {
        const { congregationId, sub } = req.auth.credentials;
        const { payload } = req.payload;
        const { source = LOCATION_INTERFACES.ALBA } = req.params;
        const { AlbaLocationImport } = req.server.models();

        const json = await csvToJson({ tsv: payload });
        if (!json) {
          console.log(`Invalid payload. Cannot create Alba session. Length=${payload ? payload.length : 0}`);
          return Boom.badData(`Invalid payload. Cannot create Alba session. Length=${payload ? payload.length : 0}`);
        }

        const session = AlbaLocationImport.createSession({ congregationId, userId: sub, payload: json, source });
        return session || null;
      } catch (ex) {
        console.error(ex);
        return Boom.badImplementation();
      }
    },
  },

  getOpenSessions: {
    async handler(req) {
      try {
        const { congregationId } = req.auth.credentials;
        const { AlbaLocationImport } = req.server.models();
        const { source = LOCATION_INTERFACES.ALBA } = req.params;

        const session = await AlbaLocationImport.getActiveSession(congregationId, source);
        return session || null;
      } catch (ex) {
        console.error(ex);
        return Boom.badImplementation();
      }
    },
  },

  importLocation: {
    async handler(req) {
      try {
        const { congregationId } = req.auth.credentials;
        const { AlbaLocationImportLocation } = req.server.models();
        const { locationId, source } = req.params;

        let location = await AlbaLocationImportLocation.findLocation(congregationId, locationId);
        if (!location) {
          return Boom.notFound();
        }

        location = await location.importLocation();
        return null;
      } catch (ex) {
        console.error(ex);
        return Boom.badImplementation();
      }
    },
  },

  preprocessAnalysis: {
    async handler(req) {
      try {
        const { congregationId } = req.auth.credentials;
        const { AlbaLocationImport } = req.server.models();
        const { source = LOCATION_INTERFACES.ALBA } = req.params;

        let session = await AlbaLocationImport.getActiveSession(congregationId, source);
        if (!session) {
          return Boom.notFound();
        }

        return session.preImportActions(source);
      } catch (ex) {
        console.error(ex);
        return Boom.badImplementation();
      }
    },
  },

  postprocessAnalysis: {
    async handler(req) {
      try {
        const { congregationId } = req.auth.credentials;
        const { AlbaLocationImport } = req.server.models();
        const { source = LOCATION_INTERFACES.ALBA } = req.params;

        let session = await AlbaLocationImport.getActiveSession(congregationId, source);
        if (!session) {
          return Boom.notFound();
        }

        return await session.postImportActions(source);
      } catch (ex) {
        console.error(ex);
        return Boom.badImplementation();
      }
    },
  },
};
