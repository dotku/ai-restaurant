import supabase from "./supabase.js";

export const User = {
  async findOne({ where }) {
    const { data, error } = await supabase
      .from("users")
      .select()
      .match(where)
      .single();

    if (error) throw error;
    return data;
  },

  async create(userData) {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const Delivery = {
  async findOne({ where }) {
    const { data, error } = await supabase
      .from("deliveries")
      .select()
      .match(where)
      .single();

    if (error) throw error;
    return data;
  },

  async create(deliveryData) {
    const { data, error } = await supabase
      .from("deliveries")
      .insert([deliveryData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from("deliveries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Sync database
supabase
  .from("users")
  .select()
  .then(() => console.log("Database synced"))
  .catch((error) => console.error("Error syncing database:", error));
