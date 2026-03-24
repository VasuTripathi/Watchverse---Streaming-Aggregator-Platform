const User = require("../models/User");

//  ADD MOVIE TO WATCHLIST
exports.addToWatchlist = async (req, res) => {
  try {
    const userId = req.user; // from authMiddleware
    const movie = req.body;

    // Validate movieId is present
    if (!movie.movieId) {
      return res.status(400).json({ message: "movieId is required" });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert string to array safely
    let watchlist = [];
    try {
      watchlist = user.watchlist ? JSON.parse(user.watchlist) : [];
    } catch (e) {
      watchlist = [];
    }

    // Check if movie already exists
    const exists = watchlist.find(
      (item) => String(item.movieId) === String(movie.movieId)
    );

    if (exists) {
      return res.json({ message: "Movie already in watchlist" });
    }

    // Add movie
    watchlist.push({
      movieId: String(movie.movieId), // ensure consistent string type
      title: movie.title,
      poster: movie.poster,
    });

    // Save updated watchlist using findByIdAndUpdate (no .save() needed)
    const updatedUser = await User.findByIdAndUpdate(userId, {
      watchlist: JSON.stringify(watchlist),
    });

    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update watchlist" });
    }

    res.json({ message: "Movie added to watchlist", watchlist });
  } catch (error) {
    console.error("addToWatchlist error:", error);
    res.status(500).json({ message: error.message });
  }
};

//  GET WATCHLIST
exports.getWatchlist = async (req, res) => {
  try {
    const userId = req.user;

    // Use findById (not findByPk - that was wrong)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let watchlist = [];
    try {
      watchlist = user.watchlist ? JSON.parse(user.watchlist) : [];
    } catch (e) {
      watchlist = [];
    }

    res.json(watchlist);
  } catch (error) {
    console.error("getWatchlist error:", error);
    res.status(500).json({ message: error.message });
  }
};

//  REMOVE MOVIE FROM WATCHLIST
exports.removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user;
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({ message: "movieId is required" });
    }

    // Use findById (not findByPk - that was wrong)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let watchlist = [];
    try {
      watchlist = user.watchlist ? JSON.parse(user.watchlist) : [];
    } catch (e) {
      watchlist = [];
    }

    // Filter out movie (compare as strings for safety)
    watchlist = watchlist.filter(
      (item) => String(item.movieId) !== String(movieId)
    );

    // Save using findByIdAndUpdate (no .save() needed)
    const updatedUser = await User.findByIdAndUpdate(userId, {
      watchlist: JSON.stringify(watchlist),
    });

    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update watchlist" });
    }

    res.json({ message: "Movie removed", watchlist });
  } catch (error) {
    console.error("removeFromWatchlist error:", error);
    res.status(500).json({ message: error.message });
  }
};