const express = require("express");
const {
  getPopular,
  getTopRated,
  getTrending,
  getDiscover,
  searchMovies,
  getMovie,
  getVideos,
  getSimilar,
  getProviders,
  validateMovieId,
} = require("../controllers/tmdbController");

const router = express.Router();

router.get("/trending/:timeWindow", getTrending);
router.get("/popular", getPopular);
router.get("/top-rated", getTopRated);
router.get("/discover", getDiscover);
router.get("/search", searchMovies);
router.get("/movie/:id/videos", validateMovieId, getVideos);
router.get("/movie/:id/similar", validateMovieId, getSimilar);
router.get("/movie/:id/providers", validateMovieId, getProviders);
router.get("/movie/:id", validateMovieId, getMovie);

module.exports = router;
