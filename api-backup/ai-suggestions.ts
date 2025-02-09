import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
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

    const promptText = `You are a helpful restaurant AI assistant. Here are the available restaurants and their menu items:
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
      messages: [{ role: "user", content: promptText }],
      model: "gpt-3.5-turbo",
    });

    const suggestion = completion.choices[0].message.content || "I'd be happy to make a recommendation!";

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 400 }
    );
  }
}