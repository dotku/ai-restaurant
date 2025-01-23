/*
  # Initial Schema Setup for Restaurant App

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `name` (text)
      - `cuisine` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
    
    - `menu_items`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `category` (text)
      - `popular` (boolean)
      - `image_url` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
*/

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cuisine text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  popular boolean DEFAULT false,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access for restaurants"
  ON restaurants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access for menu items"
  ON menu_items
  FOR SELECT
  TO public
  USING (true);

-- Insert initial data
INSERT INTO restaurants (name, cuisine, image_url) VALUES
  ('Hawi Hawaiian BBQ', 'Hawaiian', 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=800'),
  ('Sakura Japanese', 'Japanese', 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800'),
  ('Mediterranean Delight', 'Mediterranean', 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800');

INSERT INTO menu_items (restaurant_id, name, description, price, category, popular, image_url)
SELECT 
  r.id,
  item.name,
  item.description,
  item.price::decimal,
  item.category,
  item.popular,
  item.image_url
FROM restaurants r,
JSONB_TO_RECORDSET('[
  {
    "restaurant": "Hawi Hawaiian BBQ",
    "name": "BBQ Mix",
    "description": "Hawaiian BBQ chicken, BBQ beef & BBQ short ribs served with rice and macaroni salad",
    "price": 16.99,
    "category": "meat",
    "popular": true,
    "image_url": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800"
  },
  {
    "restaurant": "Hawi Hawaiian BBQ",
    "name": "Grilled Mahi Mahi",
    "description": "Fresh mahi mahi fillet grilled with our special seasoning, served with rice and macaroni salad",
    "price": 14.99,
    "category": "fish",
    "popular": true,
    "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800"
  },
  {
    "restaurant": "Sakura Japanese",
    "name": "Sushi Deluxe",
    "description": "Chef''s selection of premium nigiri and rolls",
    "price": 24.99,
    "category": "fish",
    "popular": true,
    "image_url": "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800"
  },
  {
    "restaurant": "Sakura Japanese",
    "name": "Teriyaki Chicken",
    "description": "Grilled chicken with house-made teriyaki sauce",
    "price": 16.99,
    "category": "meat",
    "popular": true,
    "image_url": "https://images.unsplash.com/photo-1667207393917-ae9aeade6da3?auto=format&fit=crop&w=800"
  },
  {
    "restaurant": "Mediterranean Delight",
    "name": "Mixed Grill Platter",
    "description": "Assortment of grilled meats with rice and salad",
    "price": 22.99,
    "category": "meat",
    "popular": true,
    "image_url": "https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?auto=format&fit=crop&w=800"
  },
  {
    "restaurant": "Mediterranean Delight",
    "name": "Falafel Plate",
    "description": "House-made crispy falafel served with creamy hummus, fresh tabbouleh, warm pita bread, tahini sauce, and Mediterranean pickles",
    "price": 14.99,
    "category": "vegetarian",
    "popular": true,
    "image_url": "https://images.unsplash.com/photo-1615868167592-304b4f8e9bfd?auto=format&fit=crop&w=800"
  }
]') AS item(restaurant text, name text, description text, price numeric, category text, popular boolean, image_url text)
WHERE r.name = item.restaurant;