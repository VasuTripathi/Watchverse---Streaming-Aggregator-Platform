const OpenAI = require("openai");
const requestTMDB = require("../services/tmdbClient");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getAISearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (typeof query !== "string" || !query.trim() || query.trim().length > 200) {
      return res.status(400).json({ message: "query must be a string between 1 and 200 characters" });
    }
    const normalizedQuery = query.trim();

    const tmdbRes = await requestTMDB("/search/movie", {
      query: normalizedQuery,
      page: 1,
      include_adult: false,
      language: "en-US",
    });
    const tmdbResults = tmdbRes.results.slice(0, 5);

    const prompt = `User is searching for: "${normalizedQuery}" on a movie streaming app.
    
Based on their search query, suggest 5 movie titles that match their intent. 
For example, if they search "action", suggest action movies. If they search "sad movies", suggest emotional/drama films.
Consider the genre, mood, and theme from their query.

Return ONLY a JSON array of movie titles, nothing else. Example format:
["Movie Title 1", "Movie Title 2", "Movie Title 3", "Movie Title 4", "Movie Title 5"]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    let aiSuggestions = [];
    try {
      const parsedSuggestions = JSON.parse(completion.choices[0].message.content);
      aiSuggestions = Array.isArray(parsedSuggestions)
        ? parsedSuggestions
            .filter(title => typeof title === "string")
            .map(title => title.trim())
            .filter(title => title.length > 0 && title.length <= 200)
            .slice(0, 5)
        : [];
    } catch (error) {
      console.error("Error parsing AI response");
      return res.json({
        suggestions: tmdbResults,
        aiEnhanced: false
      });
    }

    const enrichedSuggestions = [];
    for (const title of aiSuggestions) {
      try {
        const searchResults = await requestTMDB("/search/movie", {
          query: title,
          page: 1,
        });
        if (searchResults.results.length > 0) {
          enrichedSuggestions.push(searchResults.results[0]);
        }
      } catch (error) {
        console.error("Error fetching AI suggested movie:", error.statusCode || "provider error");
        if (error.statusCode === 503) {
          throw error;
        }
      }
    }

    const finalSuggestions = enrichedSuggestions.length > 0 ? enrichedSuggestions : tmdbResults;

    return res.json({
      suggestions: finalSuggestions,
      aiEnhanced: enrichedSuggestions.length > 0,
      query: normalizedQuery
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error("Error getting AI search suggestions:", statusCode);
    return res.status(statusCode).json({
      message: statusCode === 503
        ? "Movie data is unavailable because TMDB_API_KEY is not configured on the server."
        : "Failed to get search suggestions"
    });
  }
};

module.exports = { getAISearchSuggestions };
