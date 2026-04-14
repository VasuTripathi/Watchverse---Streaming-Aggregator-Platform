const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getRecommendations = async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a movie recommendation expert. Suggest 5 movies with short descriptions."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    res.json({
      result: response.choices[0].message.content
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "AI error" });
  }
};