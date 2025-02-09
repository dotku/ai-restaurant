import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Twilio } from 'npm:twilio@4.22.0';

// Use provided Twilio credentials
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

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
    const { to, userName, restaurantName, itemName, quantity, pickupTime } = await req.json();

    // Format pickup time
    const pickup = new Date(pickupTime);
    const formattedTime = pickup.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Create message with improved formatting
    const message = `🍽️ Order Confirmation\n\nHi ${userName}!\n\nYour order details:\n- ${quantity}x ${itemName}\n- From: ${restaurantName}\n- Pickup: ${formattedTime}\n\nWe'll notify you when your order is ready. Thank you!`;

    const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    // Send SMS
    await client.messages.create({
      body: message,
      to,
      from: TWILIO_PHONE_NUMBER
    });

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('SMS Error:', error);
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