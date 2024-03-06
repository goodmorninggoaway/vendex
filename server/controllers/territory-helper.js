const axios = require('axios');
const uuid = require('uuid/v4');
const DAL = require('../../domain/dataAccess').DAL;
const { ExportActivity } = require('../../domain/models');
const importLocations = require('../../domain/import-territory-helper');
const importTerritories = require('../../domain/territoryHelper/territories');
const SOURCES = require('../../domain/models/enums/locationInterfaces');
const exportLocations = require('../../domain/territoryHelper/export');
const thOauthHelper = require('../auth/territory-helper-oauth');
const getTerritoryHelperData = require('../../domain/territoryHelper/export/getTerritoryHelperData');
const LOC_RESULT = require('../../domain/models/enums/locationActivityResult');
const getTokens = req => { return { accessToken: req.state.th_access_token, refreshToken: req.state.th_refresh_token }; };

const handleThApiError = async (congregationId, location, error) => {
  location.ResultMessage = error.message;
  location.ResultStatusCode = error.output.statusCode;
  location.Result = LOC_RESULT.ERROR;
  await ExportActivity.updateLocationResult(congregationId, location);
  throw error;
};

const handleThApiSuccess = async (congregationId, location) => {
  location.ResultMessage = '';
  location.ResultStatusCode = 200;
  location.Result = LOC_RESULT.SUCCESS;
  await ExportActivity.updateLocationResult(congregationId, location);
};

module.exports = {
  importLocations: {
    handler: async function (req, res) {
      const tokens = getTokens(req);
      const { congregationId } = req.auth.credentials;
      const source = SOURCES.TERRITORY_HELPER;

      const terrIds = await DAL.getTerritories({
        congregationId,
        externalTerritorySource: source,
      }).select('externalTerritoryId');

      const locations = [];
      // Must get locations by territory
      await Promise.all(terrIds.map(async (terrId) => {
        const locs = await thOauthHelper.getLocations(tokens, res, terrId.externalTerritoryId);
        // only include approved locations
        const approvedLocations = locs.filter(l => l.Approved === true)
        locations.push(...approvedLocations);
      }));

      const locationTypes = await thOauthHelper.getLocationTypes(tokens, res);
      const locationStatuses = await thOauthHelper.getLocationStatuses(tokens, res);
      const locTypeMap = new Map(locationTypes.map(x => [x.Id, x]));
      const locStatusMap = new Map(locationStatuses.map(x => [x.Id, x]));

      locations.forEach(loc => {
        const locType = locTypeMap.get(loc.TypeId);
        const locStatus = locStatusMap.get(loc.StatusId);
        if (locType) {
          loc.TypeName = locType.InternalName;
        }
        if (locStatus) {
          loc.StatusName = locStatus.InternalName;
        }
        // For backwards compatibility. Not necessarily needed?
        loc.LanguageName = "Unknown";
      });

      await importLocations({
        congregationId,
        externalLocations: locations
      });
      return null;
    },
    timeout: {
      socket: false
    }
  },

  importTerritories: {
    handler: async function (req, res) {
      const tokens = getTokens(req);
      const { congregationId } = req.auth.credentials;
      const externalTerritories = await thOauthHelper.getTerritories(tokens, res);
      const externalTerritoryTypes = await thOauthHelper.getTerritoryTypes(tokens, res);
      const extTerrTypeMap = new Map(externalTerritoryTypes.map(x => [x.Id, x]));

      externalTerritories.forEach(terr => {
        const extTerrType = extTerrTypeMap.get(terr.TerritoryTypeId);
        if (extTerrType) {
          terr.TerritoryTypeName = extTerrType.Name;
          terr.TerritoryTypeCode = extTerrType.Code;
        }
      });

      await importTerritories({
        congregationId,
        externalTerritories,
      });

      return null;
    }
  },

  exportLocations: {
    handler: async function (req, res) {
      const tokens = getTokens(req);
      const { congregationId } = req.auth.credentials;
      const tracer = uuid();

      const thData = await getTerritoryHelperData(tokens, res);
      exportLocations({ congregationId, tracer, tokens, ...thData });

      return res
        .response()
        .location(`/ui/territoryhelper/exports/download?tracer=${tracer}`);
    },
  },

  getExportHistory: {
    async handler(req) {
      const { congregationId } = req.auth.credentials;

      return await ExportActivity.query()
        .column('exportActivityId', 'timestamp', 'summary')
        .where({ congregationId })
        .orderBy('timestamp', 'desc');
    },
  },

  getLatestExport: {
    async handler(req) {
      const { congregationId } = req.auth.credentials;
      const latestExport = await ExportActivity.getLatest(congregationId, 'TERRITORY_HELPER');
      if (latestExport) {
        return (await ExportActivity.getLatestExportActivities(latestExport.exportActivityId, congregationId)).rows;
      }

      return [];
    }
  },

  getTerritoryConflicts: {
    async handler(req) {
      const { congregationId } = req.auth.credentials;
      const latestExport = await ExportActivity.getLatest(congregationId, 'TERRITORY_HELPER');
      if (latestExport) {
        return (await ExportActivity.getTerritoryConflicts(latestExport.exportActivityId, congregationId)).rows;
      }
      return [];
    }
  },

  resolveTerritoryConflicts: {
    async handler(req) {
      const { congregationId } = req.auth.credentials;
      const resolvedConflicts = req.payload || [];
      return await ExportActivity.resolveTerritoryConflicts({ congregationId, resolvedConflicts });
    }
  },

  updateExportActivitySummary: {
    async handler(req) {
      const { congregationId } = req.auth.credentials;
      const { exportActivityId } = req.params;
      await ExportActivity.updateSummary(congregationId, exportActivityId);
      return null;
    }
  },

  authorize: {
    handler: async function(req, res) {
      const { code } = req.query;
      if (code) {
        const { TH_URL, TH_CLIENT_ID, TH_CLIENT_SECRET } = process.env;
        const thTokenUrl = `${TH_URL}/api/token?grant_type=authorization_code&code=${code}&client_id=${TH_CLIENT_ID}&client_secret=${TH_CLIENT_SECRET}&redirect_uri=` + encodeURIComponent(`${req.server.info.protocol}://${req.info.host}/territoryhelper/authorize`);
        const tokenResponse = await axios.post(thTokenUrl);
        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        const COOKIE_PATH = '/';
        const SECURE_COOKIE = process.env.USE_SSL !== 'false';
        const cookieOptions = {
          path: COOKIE_PATH,
          isSameSite: 'Lax',
          isSecure: SECURE_COOKIE,
        };

        return res
          .redirect()
          .state('th_access_token', access_token, { ...cookieOptions, ttl: (expires_in * 1000) })
          .state('th_refresh_token', refresh_token, cookieOptions)
          .location('/ui/territoryhelper/forward-conversion');
      }
    },
    auth: false,
  },

  thMyProfile: {
    handler: async function (req, res) {
      const tokens = getTokens(req);
      return thOauthHelper.getMyProfile(tokens, res);
    },
  },

  thTerritories: {
    handler: async function (req, res) {
      const tokens = getTokens(req);
      return thOauthHelper.getTerritories(tokens, res);
    },
  },

  thTerritoryTypes: {
    handler: async function (req, res) {
      const tokens = getTokens(req);
      return thOauthHelper.getTerritoryTypes(tokens, res);
    },
  },

  thLocations: {
    handler: async function (req, res) {
      const tokens = getTokens(req);
      const territoryId = req.params.territoryId;
      return thOauthHelper.getLocations(tokens, res, territoryId);
    },
  },

  thLocationCreate: {
    handler: async function (req, res) {
      const { congregationId } = req.auth.credentials;
      const tokens = getTokens(req);
      const location = req.payload;
      try {
        const result = await thOauthHelper.createLocation(tokens, res, location);
        await handleThApiSuccess(congregationId, location);
        return result;
      } catch (error) {
        await handleThApiError(congregationId, location, error);
      }
    },
  },

  thLocationUpdate: {
    handler: async function (req, res) {
      const { congregationId } = req.auth.credentials;
      const tokens = getTokens(req);
      const location = req.payload;
      location.Id = req.params.locationId;
      try {
        const result = await thOauthHelper.updateLocation(tokens, res, location);
        await handleThApiSuccess(congregationId, location);
        return result;
      } catch (error) {
        await handleThApiError(congregationId, location, error);
      }
    },
  },

  thLocationDelete: {
    handler: async function (req, res) {
      const { congregationId } = req.auth.credentials;
      const tokens = getTokens(req);
      const location = req.payload;
      const { locationId } = req.params;
      try {
        const result = await thOauthHelper.deleteLocation(tokens, res, locationId);
        await handleThApiSuccess(congregationId, location);
        return result;
      } catch (error) {
        await handleThApiError(congregationId, location, error);
      }
    },
  },

  thLocationStatuses: {
    handler: async function (req, res) {
      const tokens = getTokens(req);
      return thOauthHelper.getLocationStatuses(tokens, res);
    },
  },

  thLocationTypes: {
    handler: async function (req, res) {
      const tokens = getTokens(req);
      return thOauthHelper.getLocationTypes(tokens, res);
    },
  },

  thLanguages: {
    handler: async function (req, res) {
      const tokens = getTokens(req);
      return thOauthHelper.getLanguages(tokens, res);
    },
  },
};
