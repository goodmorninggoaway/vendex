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
        const { AlbaSession } = req.server.models();

        const json = await csvToJson({ tsv: payload });
        if (!json) {
          console.log(`Invalid payload. Cannot create Alba session. Length=${payload ? payload.length : 0}`);
          return Boom.badData(`Invalid payload. Cannot create Alba session. Length=${payload ? payload.length : 0}`);
        }

        return AlbaSession.createSession({ congregationId, userId: sub, payload: json });
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
        const { AlbaSession } = req.server.models();

        return await AlbaSession.query().findOne({ congregation_id: congregationId }) || null;
      } catch (ex) {
        console.error(ex);
        return Boom.badImplementation();
      }
    },
  },
};
