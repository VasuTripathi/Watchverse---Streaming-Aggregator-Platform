const User = require("../models/User");

//  ADD MOVIE TO WATCHLIST
exports.addToWatchlist = async (req, res) => {
  try {
    const userId = req.user;   // from authMiddleware
    const movie = req.body;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert string to array
    let watchlist = JSON.parse(user.watchlist);

    // Check if movie already exists
    const exists = watchlist.find(
      (item) => item.movieId === movie.movieId
    );

    if (exists) {
      return res.json({ message: "Movie already in watchlist" });
    }

    // Add movie
    watchlist.push(movie);

    // Save updated watchlist
    user.watchlist = JSON.stringify(watchlist);
    await user.save();

    res.json({ message: "Movie added to watchlist", watchlist });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//  GET WATCHLIST
exports.getWatchlist = async (req, res) => {
  try {
    const userId = req.user;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const watchlist = JSON.parse(user.watchlist);

    res.json(watchlist);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//  REMOVE MOVIE FROM WATCHLIST
exports.removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user;
    const { movieId } = req.body;

    const user = await User.findByPk(userId);

    let watchlist = JSON.parse(user.watchlist);

    // Filter out movie
    watchlist = watchlist.filter(
      (item) => item.movieId !== movieId
    );

    user.watchlist = JSON.stringify(watchlist);
    await user.save();

    res.json({ message: "Movie removed", watchlist });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};