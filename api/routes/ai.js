import AIService from "../services/aiService.js";

export const getAiSuggestions = async (req, res) => {
  try {
    const { category, preference, menuItems, restaurants } = req.body;
    const suggestion = await AIService.getAiSuggestions({
      category,
      preference,
      menuItems,
      restaurants,
    });
    res.json({ suggestion });
  } catch (error) {
    console.error("AI Suggestion Error:", error);
    res.status(400).json({ error: error.message });
  }
};
