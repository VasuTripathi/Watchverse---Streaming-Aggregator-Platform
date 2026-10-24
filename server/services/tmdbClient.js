const axios = require("axios");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const requestTMDB = async (path, params = {}) => {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error("TMDB_API_KEY is not configured on the server");
    error.statusCode = 503;
    throw error;
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}${path}`, {
      params: { ...params, api_key: apiKey },
      timeout: 15000,
    });
    return response.data;
  } catch {
    const error = new Error("Movie data provider request failed");
    error.statusCode = 502;
    throw error;
  }
};

module.exports = requestTMDB;
