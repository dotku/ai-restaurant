import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { sendOrderNotification } from '../lib/notifications';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type Restaurant = Database['public']['Tables']['restaurants']['Row'];

interface OrderModalProps {
  item: MenuItem;
  restaurant: Restaurant;
  onClose: () => void;
}

export function OrderModal({ item, restaurant, onClose }: OrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [isPickupTimeModified, setIsPickupTimeModified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  // Default preparation time is 10 minutes
  const prepTime = 10;
  
  // Calculate the minimum pickup time (10 minutes from now)
  const minPickupTime = new Date(Date.now() + prepTime * 60000);
  const formattedMinTime = minPickupTime.toISOString().slice(0, 16);
  
  // Calculate the maximum pickup time (2 days from now)
  const maxPickupTime = new Date(Date.now() + 2 * 24 * 60 * 60000).toISOString().slice(0, 16);

  // Format times for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Set default pickup time on component mount
  useEffect(() => {
    // Set the initial pickup time to 10 minutes from now
    setPickupTime(formattedMinTime);
  }, []); // Only run once on mount

  const handlePickupTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPickupTimeModified(true);
    setPickupTime(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setNotificationStatus(null);

    try {
      // Only validate pickup time if user modified it
      if (isPickupTimeModified) {
        const selectedTime = new Date(pickupTime);
        if (selectedTime < minPickupTime) {
          throw new Error(`Please select a pickup time after ${formatTime(minPickupTime)}`);
        }
      }

      // Validate phone number (simple validation)
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(phone)) {
        throw new Error('Please enter a valid phone number');
      }

      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_name: userName,
          phone,
          pickup_time: new Date(pickupTime).toISOString(),
          total_amount: item.price * quantity,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create the order item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderData.id,
          menu_item_id: item.id,
          quantity,
          price: item.price
        });

      if (itemError) throw itemError;

      // Send notification
      const { error: notificationError } = await sendOrderNotification({
        phone,
        userName,
        restaurantName: restaurant.name,
        itemName: item.name,
        quantity,
        pickupTime
      });

      if (notificationError) {
        setNotificationStatus(notificationError);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pickup Order</h2>
              <p className="text-gray-600">{restaurant.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="mb-4 text-green-500">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600">We'll see you at your pickup time.</p>
              {notificationStatus && (
                <p className="mt-4 text-orange-600 text-sm">{notificationStatus}</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-y border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-orange-600 hover:bg-orange-50 rounded-full p-1"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-lg font-medium">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-orange-600 hover:bg-orange-50 rounded-full p-1"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    ${(item.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg mb-6 overflow-hidden">
                <div className="p-4 border-b border-orange-100">
                  <div className="flex items-center text-orange-700">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-medium">Preparation Time: {prepTime} minutes</span>
                  </div>
                  <p className="text-sm text-orange-600 mt-1">
                    Earliest pickup: {formatTime(minPickupTime)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+1 (555) 555-5555"
                  />
                </div>

                <div>
                  <label htmlFor="pickup-time" className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Time
                  </label>
                  <input
                    type="datetime-local"
                    id="pickup-time"
                    required
                    min={formattedMinTime}
                    max={maxPickupTime}
                    value={pickupTime}
                    onChange={handlePickupTimeChange}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="mt-2 text-sm text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {isPickupTimeModified ? (
                      `Please select a time after ${formatTime(minPickupTime)}`
                    ) : (
                      "Default pickup time set to 10 minutes from now"
                    )}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                >
                  {isSubmitting ? 'Placing Order...' : `Place Order • $${(item.price * quantity).toFixed(2)}`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}