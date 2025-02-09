import { supabase } from './supabase';

interface SendNotificationProps {
  phone: string;
  userName: string;
  restaurantName: string;
  itemName: string;
  quantity: number;
  pickupTime: string;
}

export async function sendOrderNotification({
  phone,
  userName,
  restaurantName,
  itemName,
  quantity,
  pickupTime
}: SendNotificationProps) {
  try {
    // Format phone number to E.164 format
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('1')) {
      formattedPhone = '1' + formattedPhone;
    }
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    // Check if the function exists first
    const { data: functions } = await supabase.functions.listFunctions();
    const smsFunctionExists = functions?.some(f => f.name === 'send-sms');
    
    if (!smsFunctionExists) {
      throw new Error('SMS function is not deployed. Please deploy the send-sms function to Supabase.');
    }

    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: {
        to: formattedPhone,
        userName,
        restaurantName,
        itemName,
        quantity,
        pickupTime
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    // Provide more specific error messages
    let errorMessage = 'Failed to send notification';
    if (error instanceof Error) {
      if (error.message.includes('not deployed')) {
        errorMessage = 'SMS service is not configured. Your order was placed successfully, but you will not receive an SMS confirmation.';
      } else if (error.message.includes('Invalid phone number')) {
        errorMessage = 'Invalid phone number format. Please check your phone number.';
      } else {
        errorMessage = `SMS notification failed: ${error.message}`;
      }
    }
    console.error('Notification error:', error);
    return { success: false, error: errorMessage };
  }
}