import React, { useState, useEffect } from "react";
import {
  ChefHat,
  Fish,
  Beef,
  Salad,
  ThumbsUp,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import type { Database } from "./lib/database.types";
import { OrderModal } from "./components/OrderModal";

const API_BASE_URL = import.meta.env.DEV ? "http://localhost:3000" : "";

type FoodCategory = "all" | "meat" | "fish" | "vegetarian";
type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

interface OrderModalState {
  isOpen: boolean;
  item: MenuItem | null;
  restaurant: Restaurant | null;
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [userPreference, setUserPreference] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedItems, setSuggestedItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [orderModal, setOrderModal] = useState<OrderModalState>({
    isOpen: false,
    item: null,
    restaurant: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const { data: restaurantsData, error: restaurantsError } =
          await supabase.from("restaurants").select("*");

        if (restaurantsError) throw restaurantsError;

        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from("menu_items")
          .select("*");

        if (menuItemsError) throw menuItemsError;

        if (restaurantsData) setRestaurants(restaurantsData);
        if (menuItemsData) setMenuItems(menuItemsData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch data";
        setError(errorMessage);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateAISuggestion = async (
    category: FoodCategory,
    preference?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          preference,
          menuItems,
          restaurants,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI suggestion");
      }

      const data = await response.json();
      const suggestion =
        data?.suggestion || "I'd be happy to make a recommendation!";
      setAiSuggestion(suggestion);

      const suggestedDishes = menuItems.filter((item) =>
        suggestion.toLowerCase().includes(item.name.toLowerCase())
      );
      setSuggestedItems(suggestedDishes);
    } catch (error) {
      setError("Failed to generate AI suggestion");
      setAiSuggestion("I'd be happy to make a recommendation!");
      setSuggestedItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateAISuggestion(selectedCategory, userPreference);
  };

  const handleOrderClick = (item: MenuItem) => {
    const restaurant = restaurants.find((r) => r.id === item.restaurant_id);
    if (restaurant) {
      setOrderModal({
        isOpen: true,
        item,
        restaurant,
      });
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <ChefHat className="h-8 w-8 text-orange-500 animate-bounce" />
          <span className="text-lg font-medium text-gray-700">
            Loading menu data...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Data
          </h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="bg-orange-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-orange-800">
              If you're seeing this error, please make sure:
              <ul className="list-disc ml-4 mt-2">
                <li>You've clicked "Connect to Supabase" in the top right</li>
                <li>Your database tables are properly set up</li>
                <li>Your environment variables are correctly configured</li>
              </ul>
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <ChefHat className="h-8 w-8 sm:h-10 sm:w-10" />
                <h1 className="ml-3 text-2xl sm:text-3xl font-bold">
                  AI Restaurant
                </h1>
              </div>
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search menu..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-orange-400 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-orange-400/20 text-white placeholder-orange-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-orange-100" />
              </div>
            </div>

            <form
              onSubmit={handlePreferenceSubmit}
              className="bg-white/10 rounded-lg p-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Tell us your food preferences or dietary restrictions..."
                  value={userPreference}
                  onChange={(e) => setUserPreference(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-orange-400/50 placeholder-orange-100 text-white focus:ring-2 focus:ring-white focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-white text-orange-600 px-6 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center font-semibold whitespace-nowrap"
                  disabled={isLoading}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Get AI Suggestions
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  generateAISuggestion("all", userPreference);
                }}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  selectedCategory === "all"
                    ? "bg-white text-orange-600"
                    : "bg-orange-400/20 text-white"
                } hover:bg-white hover:text-orange-600 transition-all`}
              >
                <ThumbsUp className="h-5 w-5 mr-2" />
                All Items
              </button>
              <button
                onClick={() => {
                  setSelectedCategory("meat");
                  generateAISuggestion("meat", userPreference);
                }}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  selectedCategory === "meat"
                    ? "bg-white text-orange-600"
                    : "bg-orange-400/20 text-white"
                } hover:bg-white hover:text-orange-600 transition-all`}
              >
                <Beef className="h-5 w-5 mr-2" />
                Meat
              </button>
              <button
                onClick={() => {
                  setSelectedCategory("fish");
                  generateAISuggestion("fish", userPreference);
                }}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  selectedCategory === "fish"
                    ? "bg-white text-orange-600"
                    : "bg-orange-400/20 text-white"
                } hover:bg-white hover:text-orange-600 transition-all`}
              >
                <Fish className="h-5 w-5 mr-2" />
                Fish
              </button>
              <button
                onClick={() => {
                  setSelectedCategory("vegetarian");
                  generateAISuggestion("vegetarian", userPreference);
                }}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  selectedCategory === "vegetarian"
                    ? "bg-white text-orange-600"
                    : "bg-orange-400/20 text-white"
                } hover:bg-white hover:text-orange-600 transition-all`}
              >
                <Salad className="h-5 w-5 mr-2" />
                Vegetarian
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {aiSuggestion && (
          <div className="mb-6 sm:mb-8 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start">
              <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mt-1" />
              <div className="ml-4 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                  AI Chef's Suggestions
                </h3>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-pulse flex items-center text-orange-600">
                      <ChefHat className="h-6 w-6 mr-2 animate-bounce" />
                      <span className="text-lg">
                        Crafting personalized suggestions for you...
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 text-base sm:text-lg mb-4">
                      {aiSuggestion}
                    </p>
                    {suggestedItems.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Featured Suggestions:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {suggestedItems.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white rounded-lg shadow-md p-4 border border-orange-200"
                            >
                              <div className="flex items-start">
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                                <div className="ml-3 flex-1">
                                  <h5 className="font-semibold text-gray-900">
                                    {item.name}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {
                                      restaurants.find(
                                        (r) => r.id === item.restaurant_id
                                      )?.name
                                    }
                                  </p>
                                  <div className="mt-2 flex justify-between items-center">
                                    <span className="font-bold text-orange-600">
                                      ${item.price.toFixed(2)}
                                    </span>
                                    <button
                                      onClick={() => handleOrderClick(item)}
                                      className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                                    >
                                      Order Now
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 sm:space-y-8">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                  />
                  <div className="ml-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {restaurant.name}
                    </h2>
                    <p className="text-gray-600">
                      {restaurant.cuisine} Cuisine
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredItems
                    .filter((item) => item.restaurant_id === restaurant.id)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col h-full"
                      >
                        <div className="relative">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-48 object-cover"
                          />
                          {suggestedItems.some(
                            (suggested) => suggested.id === item.id
                          ) && (
                            <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full flex items-center">
                              <Star className="h-4 w-4 mr-1" />
                              <span className="text-sm font-medium">
                                Suggested
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.name}
                            </h3>
                            {item.popular && (
                              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 flex-1">
                            {item.description}
                          </p>
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gray-900">
                                ${item.price.toFixed(2)}
                              </span>
                              <button
                                onClick={() => handleOrderClick(item)}
                                className="bg-orange-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                              >
                                Order Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {orderModal.isOpen && orderModal.item && orderModal.restaurant && (
        <OrderModal
          item={orderModal.item}
          restaurant={orderModal.restaurant}
          onClose={() =>
            setOrderModal({ isOpen: false, item: null, restaurant: null })
          }
        />
      )}
    </div>
  );
}

export default App;
