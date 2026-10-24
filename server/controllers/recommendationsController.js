const Activity = require("../models/Activity");
const OpenAI = require("openai");
const requestTMDB = require("../services/tmdbClient");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getRecommendations = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (typeof user_id !== "string" || !user_id.trim() || user_id.length > 128) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const activities = await Activity.findByUserId(user_id);

    if (activities.length === 0) {
      const popularMovies = await requestTMDB("/movie/popular", { page: 1 });
      return res.json({ recommendations: popularMovies.results.slice(0, 10) });
    }

    const movieTitles = activities
      .map(activity => activity.movie?.title)
      .filter(title => typeof title === "string" && title.trim())
      .slice(0, 10);

    const prompt = `Based on the user's interest in these movies: ${movieTitles.join(", ")}, recommend 10 similar movies. Return only a JSON array of movie titles, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    const parsedTitles = JSON.parse(completion.choices[0].message.content);
    const recommendedTitles = Array.isArray(parsedTitles)
      ? parsedTitles
          .filter(title => typeof title === "string")
          .map(title => title.trim())
          .filter(title => title.length > 0 && title.length <= 200)
          .slice(0, 10)
      : [];

    const recommendations = [];
    for (const title of recommendedTitles) {
      try {
        const searchResults = await requestTMDB("/search/movie", {
          query: title,
          page: 1,
        });
        if (searchResults.results.length > 0) {
          recommendations.push(searchResults.results[0]);
        }
      } catch (error) {
        console.error("Error fetching recommended movie:", error.statusCode || "provider error");
        if (error.statusCode === 503) {
          throw error;
        }
      }
    }

    return res.json({ recommendations });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error("Error getting recommendations:", statusCode);
    return res.status(statusCode).json({
      message: statusCode === 503
        ? "Movie data is unavailable because TMDB_API_KEY is not configured on the server."
        : "Failed to get recommendations"
    });
  }
};

module.exports = { getRecommendations };
