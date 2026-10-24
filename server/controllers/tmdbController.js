const requestTMDB = require("../services/tmdbClient");

const getSingleQueryValue = value => (
  typeof value === "string" ? value : undefined
);

const parseOptionalInteger = (value, min, max) => {
  if (value === undefined) {
    return { valid: true, value: undefined };
  }
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return { valid: false };
  }
  const parsed = Number(value);
  return parsed >= min && parsed <= max
    ? { valid: true, value: parsed }
    : { valid: false };
};

const getMovieListParams = (query, includeFilters = true) => {
  const page = parseOptionalInteger(query.page, 1, 500);
  const year = parseOptionalInteger(query.year, 1870, 2100);
  const genre = getSingleQueryValue(query.genre);
  const ratingText = getSingleQueryValue(query.rating);
  const rating = ratingText === undefined ? undefined : Number(ratingText);

  if (
    !page.valid ||
    !year.valid ||
    (query.genre !== undefined && genre === undefined) ||
    (query.rating !== undefined && ratingText === undefined) ||
    (genre !== undefined && (!/^\d+(,\d+)*$/.test(genre) || genre.length > 100)) ||
    (ratingText !== undefined &&
      (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(ratingText) || rating < 0 || rating > 10))
  ) {
    return null;
  }

  const params = {
    page: page.value || 1,
    language: "en-US",
    include_adult: false,
  };
  if (includeFilters && genre !== undefined) params.with_genres = genre;
  if (includeFilters && year.value !== undefined) params.primary_release_year = year.value;
  if (includeFilters && rating !== undefined) params["vote_average.gte"] = rating;
  return params;
};

const sendProviderError = (res, error) => {
  const statusCode = error.statusCode || 502;
  console.error("TMDB request failed:", statusCode);
  return res.status(statusCode).json({
    message: statusCode === 503
      ? "Movie data is unavailable because TMDB_API_KEY is not configured on the server."
      : "Failed to load movie data"
  });
};

const proxy = (pathForRequest, paramsForRequest = () => ({})) => async (req, res) => {
  try {
    const params = paramsForRequest(req);
    const path = pathForRequest(req);
    if (params === null || typeof path !== "string") {
      return res.status(400).json({ message: "Invalid movie request parameters" });
    }
    const data = await requestTMDB(path, params);
    return res.json(data);
  } catch (error) {
    return sendProviderError(res, error);
  }
};

const getSearchParams = req => {
  const query = getSingleQueryValue(req.query.query)?.trim();
  if (!query || query.length > 200) return null;

  const params = getMovieListParams(req.query, false);
  if (!params) return null;
  params.query = query;
  const genre = getSingleQueryValue(req.query.genre);
  const ratingText = getSingleQueryValue(req.query.rating);
  if (genre !== undefined) params.with_genres = genre;
  if (ratingText !== undefined) params["vote_average.gte"] = Number(ratingText);
  if (req.query.year !== undefined) params.year = Number(req.query.year);
  return params;
};

const getMovieIdPath = (req, suffix = "") => (
  /^\d{1,12}$/.test(req.params.id)
    ? `/movie/${req.params.id}${suffix}`
    : null
);

const getTrendingPath = req => (
  ["day", "week"].includes(req.params.timeWindow)
    ? `/trending/movie/${req.params.timeWindow}`
    : null
);

const validateMovieId = (req, res, next) => {
  if (!/^\d{1,12}$/.test(req.params.id)) {
    return res.status(400).json({ message: "Invalid movie id" });
  }
  return next();
};

module.exports = {
  getPopular: proxy(() => "/movie/popular"),
  getTopRated: proxy(() => "/movie/top_rated"),
  getTrending: proxy(getTrendingPath),
  getDiscover: proxy(() => "/discover/movie", req => getMovieListParams(req.query)),
  searchMovies: proxy(() => "/search/movie", getSearchParams),
  getMovie: proxy(req => getMovieIdPath(req)),
  getVideos: proxy(req => getMovieIdPath(req, "/videos")),
  getSimilar: proxy(req => getMovieIdPath(req, "/similar")),
  getProviders: proxy(req => getMovieIdPath(req, "/watch/providers")),
  validateMovieId,
};
