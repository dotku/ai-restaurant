import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'https://esm.sh/openai@4.28.0';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { category, preference, menuItems, restaurants } = await req.json();

    const relevantItems = menuItems.filter((item: any) => 
      category === 'all' || item.category === category
    );

    const restaurantInfo = restaurants.map((r: any) => ({
      name: r.name,
      cuisine: r.cuisine,
      items: relevantItems.filter((item: any) => item.restaurant_id === r.id)
    }));

    const prompt = `You are a helpful restaurant AI assistant. Here are the available restaurants and their menu items:
      ${restaurantInfo.map((r: any) => `
        ${r.name} (${r.cuisine}):
        ${r.items.map((item: any) => `- ${item.name}: ${item.description} (${item.category})`).join('\n')}
      `).join('\n')}
      
      ${preference ? `The customer has the following preferences: ${preference}. ` : ''}
      Please provide personalized recommendations across all restaurants for ${category === 'all' ? 'any dish' : category + ' dishes'}. 
      Consider dietary preferences if provided. Suggest specific dishes from different restaurants that might appeal to the customer. 
      Keep it casual and brief, like a knowledgeable concierge would suggest.
      
      Also, return the exact names of 2-3 specific dishes you're recommending.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const suggestion = completion.choices[0].message.content || "I'd be happy to make a recommendation!";

    return new Response(
      JSON.stringify({ suggestion }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});