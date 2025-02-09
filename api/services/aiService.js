import OpenAI from "openai";

/**
 * Generate AI suggestions for menu items based on category and preferences
 * @param {Object} params
 * @param {string} params.category - The category of food to filter by
 * @param {string} params.preference - User's food preferences
 * @param {Array} params.menuItems - List of menu items
 * @param {Array} params.restaurants - List of restaurants
 * @returns {Promise<string>} The AI-generated suggestion
 */
export async function getAiSuggestions({
  category,
  preference,
  menuItems,
  restaurants,
}) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const relevantItems = menuItems.filter(
    (item) => category === "all" || item.category === category
  );

  const restaurantInfo = restaurants.map((r) => ({
    name: r.name,
    cuisine: r.cuisine,
    items: relevantItems.filter((item) => item.restaurant_id === r.id),
  }));

  const prompt = `You are a helpful restaurant AI assistant. Here are the available restaurants and their menu items:
    ${restaurantInfo
      .map(
        (r) => `
      ${r.name} (${r.cuisine}):
      ${r.items
        .map((item) => `- ${item.name}: ${item.description} (${item.category})`)
        .join("\n")}
    `
      )
      .join("\n")}
    
    ${
      preference
        ? `The customer has the following preferences: ${preference}. `
        : ""
    }
    Please provide personalized recommendations across all restaurants for ${
      category === "all" ? "any dish" : category + " dishes"
    }. 
    Consider dietary preferences if provided. Suggest specific dishes from different restaurants that might appeal to the customer. 
    Keep it casual and brief, like a knowledgeable concierge would suggest.
    
    Also, return the exact names of 2-3 specific dishes you're recommending.`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  return (
    completion.choices[0].message.content ||
    "I'd be happy to make a recommendation!"
  );
}

export default {
  getAiSuggestions,
};
