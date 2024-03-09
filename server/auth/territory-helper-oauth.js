const axios = require('axios');
const Boom = require('boom');

const COOKIE_PATH = '/';
const SECURE_COOKIE = process.env.USE_SSL !== 'false';
const cookieOptions = {
  path: COOKIE_PATH,
  isSameSite: 'Lax',
  isSecure: SECURE_COOKIE
};

const { TH_URL, TH_CLIENT_ID, TH_CLIENT_SECRET } = process.env;

const isExpiredTokenError = (error) => {
  //"invalid_token"
  return error.response && error.response.status == 400 && error.response.data && error.response.data.Error === 'expired_token';
};

const refreshAccessToken = async (refreshToken, res) => {
  const result = await axios.post(`${TH_URL}/api/token?grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${TH_CLIENT_ID}&client_secret=${TH_CLIENT_SECRET}`);
  const { access_token, refresh_token, expires_in } = result.data;
  res.state('th_access_token', access_token, { ...cookieOptions, ttl: (expires_in * 1000) });
  res.state('th_refresh_token', refresh_token, cookieOptions);

  return access_token;
};

const executeThRequest = async (tokens, res, thRequest) => {
  let { accessToken } = tokens;
  const { refreshToken } = tokens;

  if (!accessToken && refreshToken) {
    accessToken = await refreshAccessToken(refreshToken, res);
  }

  try {
    const result = await thRequest(accessToken);
    return result.data;
  } catch (error) {
    if (isExpiredTokenError(error)) {
      accessToken = await refreshAccessToken(refreshToken, res).access_token;
      return await thRequest(accessToken).data;
    } else {
      if (error.response) {
        const errorMessage = `Error executing territory helper request. ${(error.response.data && error.response.data.message) || ''}`;
        console.error(errorMessage);
        throw new Boom(errorMessage, { statusCode: error.response.status, data: error.response.data });
      } else {
        throw Boom.badImplementation("Something went wrong.", error);
      }
    }
  }
};

module.exports = {
  getLanguages: async (tokens, res) => {
    return await executeThRequest(tokens, res, (accessToken) => {
      return axios.get(`${TH_URL}/api/languages?access_token=${accessToken}`);
    });
  },
  getLocations: async (tokens, res, territoryId) => {
    return await executeThRequest(tokens, res, (accessToken) => {
      return axios.get(`${TH_URL}/api/territories/${territoryId}/locations?access_token=${accessToken}`);
    });
  },
  getLocationStatuses: async (tokens, res) => {
    return await executeThRequest(tokens, res, (accessToken) => {
      return axios.get(`${TH_URL}/api/locationstatuses?access_token=${accessToken}`);
    });
  },
  getLocationTypes: async (tokens, res) => {
    return await executeThRequest(tokens, res, (accessToken) => {
      return axios.get(`${TH_URL}/api/locationtypes?access_token=${accessToken}`);
    });
  },
  getMyProfile: async (tokens, res) => {
    return await executeThRequest(tokens, res, (accessToken) => {
      return axios.get(`${TH_URL}/api/publishers/me?access_token=${accessToken}`);
    });
  },
  getTerritories: async (tokens, res) => {
    return await executeThRequest(tokens, res, (accessToken) => {
      return axios.get(`${TH_URL}/api/territories?access_token=${accessToken}`);
    });
  },
  getTerritoryTypes: async (tokens, res) => {
    return await executeThRequest(tokens, res, (accessToken) => {
      return axios.get(`${TH_URL}/api/territorytypes?access_token=${accessToken}`);
    });
  },
  updateLocation: async (tokens, res, location) => {
    return await executeThRequest(tokens, res, (accessToken) => {
      return axios.put(`${TH_URL}/api/locations/${location.Id}?access_token=${accessToken}`, location);
    });
  },
  createLocation: async (tokens, res, location) => {
    return await executeThRequest(tokens, res, (accessToken) => {
      return axios.post(`${TH_URL}/api/locations?access_token=${accessToken}`, location);
    });
  },
  deleteLocation: async (tokens, res, locationId) => {
    return await executeThRequest(tokens, res, (accessToken) => {
      return axios.delete(`${TH_URL}/api/locations/${locationId}?access_token=${accessToken}`);
    });
  }
};
