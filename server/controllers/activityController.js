const Activity = require("../models/Activity");

const saveActivity = async (req, res) => {
  try {
    const { movie } = req.body;

    if (!movie || typeof movie !== "object" || Array.isArray(movie)) {
      return res.status(400).json({ message: "movie must be a movie object" });
    }

    const activity = await Activity.create({
      user_id: req.user,
      movie,
      created_at: new Date()
    });

    return res.status(201).json({ message: "Activity saved", activity });
  } catch (error) {
    console.error("Error saving activity:", error);
    return res.status(500).json({ message: "Failed to save activity" });
  }
};

module.exports = { saveActivity };