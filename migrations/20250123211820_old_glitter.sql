/*
  # Add pickup orders functionality

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `user_name` (text)
      - `phone` (text)
      - `pickup_time` (timestamptz)
      - `total_amount` (decimal)
      - `status` (text)
      - `created_at` (timestamptz)

    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `menu_item_id` (uuid, references menu_items)
      - `quantity` (integer)
      - `price` (decimal)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since we're not using authentication for pickup orders)
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  phone text NOT NULL,
  pickup_time timestamptz NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public insert access for orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access for orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access for order items"
  ON order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access for order items"
  ON order_items
  FOR SELECT
  TO public
  USING (true);