const User = require("../models/User");

//  ADD MOVIE TO WATCHLIST
exports.addToWatchlist = async (req, res) => {
  try {
    const userId = req.user; // from authMiddleware
    const movie = req.body;

    console.log("📌 Adding to watchlist - UserId:", userId, "Movie:", movie);

    // Validate movieId is present
    if (!movie.movieId) {
      return res.status(400).json({ message: "movieId is required" });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("👤 User found:", user.id);

    // Convert string to array safely
    let watchlist = [];
    try {
      watchlist = user.watchlist ? JSON.parse(user.watchlist) : [];
    } catch (e) {
      console.warn("⚠️ JSON parse error for watchlist:", e.message);
      watchlist = [];
    }

    console.log("📋 Current watchlist length:", watchlist.length);

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
      dateAdded: new Date().toISOString(),
    });

    console.log("➕ Movie added, new watchlist length:", watchlist.length);

    // Save updated watchlist using findByIdAndUpdate (no .save() needed)
    const updatedUser = await User.findByIdAndUpdate(userId, {
      watchlist: JSON.stringify(watchlist),
    });

    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update watchlist" });
    }

    console.log("✅ Watchlist updated successfully");

    res.json({ message: "Movie added to watchlist", watchlist });
  } catch (error) {
    console.error("❌ addToWatchlist error:", error);
    res.status(500).json({ message: error.message });
  }
};

//  GET WATCHLIST
exports.getWatchlist = async (req, res) => {
  try {
    const userId = req.user;

    console.log("📌 Get Watchlist - UserId:", userId);

    // Use findById (not findByPk - that was wrong)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let watchlist = [];
    try {
      watchlist = user.watchlist ? JSON.parse(user.watchlist) : [];
    } catch (e) {
      console.warn("⚠️ JSON parse error:", e.message);
      watchlist = [];
    }

    console.log("✅ Returning watchlist with", watchlist.length, "movies");

    res.json(watchlist);
  } catch (error) {
    console.error("❌ getWatchlist error:", error);
    res.status(500).json({ message: error.message });
  }
};

//  REMOVE MOVIE FROM WATCHLIST
exports.removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user;
    const { movieId } = req.body;

    console.log("📌 Remove from Watchlist - UserId:", userId, "MovieId:", movieId);

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
      console.warn("⚠️ JSON parse error:", e.message);
      watchlist = [];
    }

    console.log("📋 Before removal - watchlist length:", watchlist.length);

    // Filter out movie (compare as strings for safety)
    watchlist = watchlist.filter(
      (item) => String(item.movieId) !== String(movieId)
    );

    console.log("📋 After removal - watchlist length:", watchlist.length);

    // Save using findByIdAndUpdate (no .save() needed)
    const updatedUser = await User.findByIdAndUpdate(userId, {
      watchlist: JSON.stringify(watchlist),
    });

    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update watchlist" });
    }

    console.log("✅ Movie removed successfully");

    res.json({ message: "Movie removed", watchlist });
  } catch (error) {
    console.error("❌ removeFromWatchlist error:", error);
    res.status(500).json({ message: error.message });
  }
};