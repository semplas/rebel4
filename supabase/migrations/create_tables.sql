-- First, create the extension for UUID generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category TEXT,
  description TEXT,
  features JSONB,
  color TEXT,
  is_new BOOLEAN DEFAULT false,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update products table to include type column
ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'shoe';

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_categories junction table
CREATE TABLE IF NOT EXISTS product_categories (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_intent_id TEXT,
  payment_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  shipping_address TEXT,
  billing_address TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create cart table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create banners table for homepage
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  button_text TEXT,
  button_link TEXT,
  color TEXT,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER CHECK (discount_percent > 0 AND discount_percent <= 100),
  discount_amount DECIMAL(10,2) CHECK (discount_amount >= 0),
  min_purchase DECIMAL(10,2) DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table for site configuration
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for secure access
-- Use DO block to check if policies exist before creating them
DO $$
BEGIN
  -- Products policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Products are viewable by everyone'
  ) THEN
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Products are editable by admins'
  ) THEN
    CREATE POLICY "Products are editable by admins" ON products FOR ALL USING (
      auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
    );
  END IF;

  -- Add a new policy specifically for INSERT operations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admins can insert products'
  ) THEN
    CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (
      auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
    );
  END IF;

  -- Add a new policy specifically for UPDATE operations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admins can update products'
  ) THEN
    CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (
      auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
    );
  END IF;

  -- Add a new policy specifically for DELETE operations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admins can delete products'
  ) THEN
    CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (
      auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
    );
  END IF;

  -- Profiles policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() AND p.is_admin = true
      )
    );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Cart policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cart_items' AND policyname = 'Users can manage their own cart'
  ) THEN
    ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage their own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Wishlist policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wishlist_items' AND policyname = 'Users can manage their own wishlist'
  ) THEN
    ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage their own wishlist" ON wishlist_items FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Orders policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can view their own orders'
  ) THEN
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can view all orders'
  ) THEN
    CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
      auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
    );
  END IF;

  -- Reviews policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Reviews are viewable by everyone'
  ) THEN
    ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can manage their own reviews'
  ) THEN
    CREATE POLICY "Users can manage their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can update their own reviews'
  ) THEN
    CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can delete their own reviews'
  ) THEN
    CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;
