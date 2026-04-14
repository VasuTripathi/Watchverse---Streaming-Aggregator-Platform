const Activity = require("../models/Activity");
const axios = require("axios");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set this in .env
});

const TMDB_API_KEY = "c3eb192bb06b83bf9707742f3f5d851a"; // Same as client

const getRecommendations = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    // Fetch user's activities
    const activities = await Activity.findByUserId(user_id);

    if (activities.length === 0) {
      // If no activities, return popular movies
      const popularRes = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`);
      return res.json({ recommendations: popularRes.data.results.slice(0, 10) });
    }

    // Extract movie titles from activities
    const movieTitles = activities.map(activity => activity.movie.title).slice(0, 10); // Limit to recent 10

    // Use OpenAI to generate recommendations
    const prompt = `Based on the user's interest in these movies: ${movieTitles.join(", ")}, recommend 10 similar movies. Return only a JSON array of movie titles, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    const recommendedTitles = JSON.parse(completion.choices[0].message.content);

    // Fetch movie details from TMDB for each recommended title
    const recommendations = [];
    for (const title of recommendedTitles) {
      try {
        const searchRes = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
        if (searchRes.data.results.length > 0) {
          recommendations.push(searchRes.data.results[0]);
        }
      } catch (error) {
        console.error(`Error fetching movie: ${title}`, error);
      }
    }

    res.json({ recommendations });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({ message: "Failed to get recommendations" });
  }
};

module.exports = { getRecommendations };