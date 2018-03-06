const Boom = require('boom');
const importLocations = require('../../domain/alba/import');
const { handler: csvToJson } = require('../../domain/alba/import/convertCsvToJson');

module.exports = {
  importLocations: {
    handler: async function (req, res) {
      const { congregationId } = req.auth.credentials;

      return importLocations({
        congregationId,
        inputData: req.payload,
      });
    },
  },

  createSession: {
    async handler(req) {
      try {
        const { congregationId, sub } = req.auth.credentials;
        const { payload } = req.payload;
        const { AlbaLocationImport } = req.server.models();

        const json = await csvToJson({ tsv: payload });
        if (!json) {
          console.log(`Invalid payload. Cannot create Alba session. Length=${payload ? payload.length : 0}`);
          return Boom.badData(`Invalid payload. Cannot create Alba session. Length=${payload ? payload.length : 0}`);
        }

        const session = AlbaLocationImport.createSession({ congregationId, userId: sub, payload: json });
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

        const session = await AlbaLocationImport.getActiveSession(congregationId);
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
        const { congregationId, sub: userId } = req.auth.credentials;
        const { AlbaLocationImportLocation } = req.server.models();
        const { locationId } = req.params;

        let location = await AlbaLocationImportLocation.findLocation(congregationId, locationId);
        if (!location) {
          return Boom.notFound();
        }

        location = await location.importLocation(userId, congregationId, locationId);
        return location;
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

        let location = await AlbaLocationImport.getActiveSession(congregationId);
        if (!location) {
          return Boom.notFound();
        }

        return location.runPreLocationImportAnalysis();
      } catch (ex) {
        console.error(ex);
        return Boom.badImplementation();
      }
    },
  },
};
