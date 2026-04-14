const Activity = require("../models/Activity");

const saveActivity = async (req, res) => {
  try {
    const { user_id, movie } = req.body;

    if (!user_id || !movie) {
      return res.status(400).json({ message: "user_id and movie are required" });
    }

    const activity = await Activity.create({
      user_id,
      movie,
      created_at: new Date()
    });

    res.status(201).json({ message: "Activity saved", activity });
  } catch (error) {
    console.error("Error saving activity:", error);
    res.status(500).json({ message: "Failed to save activity" });
  }
};

module.exports = { saveActivity };