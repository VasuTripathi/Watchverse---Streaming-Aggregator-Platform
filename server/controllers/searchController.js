const axios = require("axios");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TMDB_API_KEY = "c3eb192bb06b83bf9707742f3f5d851a";

const getAISearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "query is required" });
    }

    // Step 1: Get TMDB search results
    const tmdbRes = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`
    );

    const tmdbResults = tmdbRes.data.results.slice(0, 5);

    // Step 2: Use OpenAI to understand search intent and get recommendations
    const prompt = `User is searching for: "${query}" on a movie streaming app.
    
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
      aiSuggestions = JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.error("Error parsing AI response:", err);
      // Fallback to TMDB results if AI parsing fails
      return res.json({ 
        suggestions: tmdbResults,
        aiEnhanced: false 
      });
    }

    // Step 3: Search TMDB for each AI-suggested title to get movie objects
    const enrichedSuggestions = [];
    for (const title of aiSuggestions) {
      try {
        const searchRes = await axios.get(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
        );
        if (searchRes.data.results.length > 0) {
          enrichedSuggestions.push(searchRes.data.results[0]);
        }
      } catch (err) {
        console.error(`Error fetching AI suggested movie: ${title}`, err);
      }
    }

    // Return AI-enhanced suggestions, fallback to TMDB if not enough results
    const finalSuggestions = enrichedSuggestions.length > 0 ? enrichedSuggestions : tmdbResults;

    res.json({
      suggestions: finalSuggestions,
      aiEnhanced: enrichedSuggestions.length > 0,
      query: query
    });
  } catch (error) {
    console.error("Error getting AI search suggestions:", error);
    res.status(500).json({ message: "Failed to get search suggestions" });
  }
};

module.exports = { getAISearchSuggestions };
