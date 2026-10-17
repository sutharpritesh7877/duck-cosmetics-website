-- ==============================================================================
-- DUCK COSMETICS — PRODUCTION SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ==============================================================================
-- Run this complete script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It creates all tables, triggers, helper functions, and strict Row Level Security (RLS) policies.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLES CREATION
-- ==============================================================================

-- 2.1 PROFILES TABLE (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager', 'staff')),
  address_line1 TEXT DEFAULT '',
  address_line2 TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT 'Gujarat',
  pincode TEXT DEFAULT '',
  country TEXT DEFAULT 'India',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.2 CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  tagline TEXT DEFAULT '',
  image TEXT NOT NULL,
  tone TEXT DEFAULT 'bg-lilac',
  display_order INT DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.3 PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  detail TEXT DEFAULT '',
  mrp NUMERIC(10, 2) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  cost_price NUMERIC(10, 2) DEFAULT 0,
  stock INT NOT NULL DEFAULT 50,
  reserved_stock INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 10,
  hsn_code TEXT DEFAULT '33049910',
  gst_rate NUMERIC(4, 2) DEFAULT 18,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  badge TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.4 SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT DEFAULT 'Duck Cosmetics',
  legal_entity_name TEXT DEFAULT 'Duck Care Private Limited',
  brand_tagline TEXT DEFAULT 'Care for Every Little Moment',
  support_email TEXT DEFAULT 'crm@duckcosmetics.in',
  support_phone1 TEXT DEFAULT '+91 98250 10194',
  support_phone2 TEXT DEFAULT '+91 83202 64296',
  support_phone3 TEXT DEFAULT '+91 95123 10194',
  address TEXT DEFAULT 'A/404, 4th Floor, Doctor House, Near Parimal Crossing, Ellis Bridge, Ahmedabad – 380006, Gujarat, India.',
  gstin TEXT DEFAULT '24AAACD1234F1Z8',
  pan TEXT DEFAULT 'AAACD1234F',
  free_shipping_threshold NUMERIC(10, 2) DEFAULT 999,
  standard_shipping_fee NUMERIC(10, 2) DEFAULT 79,
  auto_free_face_wash_offer BOOLEAN DEFAULT true,
  hero_headline TEXT DEFAULT 'Gentle daily care for your whole family.',
  hero_subtitle TEXT DEFAULT 'Thoughtfully crafted baby care, everyday cosmetics, soothing vapor balms, and herbal ortho oils. Made with plant-rich formulas and verified safety for Indian homes.',
  promo_banner_text TEXT DEFAULT 'Buy any cosmetic and unlock a free face wash (₹349 value)',
  logo_url TEXT DEFAULT '/duck-logo.png',
  announcement_ticker JSONB DEFAULT '["Free India shipping on orders over ₹999", "Buy any cosmetic, get a free Daily Fresh Face Wash", "Fast delivery across India with live SMS tracking", "Dermatologically tested · Gentle plant formulations"]'::jsonb,
  serviceable_pincodes TEXT[] DEFAULT ARRAY['380006', '380001', '380015', '400001', '400050', '110001', '110020', '560001', '560034', '600001', '700001', '500001', '302001', '226001'],
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.5 PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  type TEXT DEFAULT 'free_gift',
  qualifying_category TEXT DEFAULT 'Cosmetics',
  gift_product_name TEXT DEFAULT 'Daily Fresh Face Wash',
  gift_max_quantity INT DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.6 ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount_total NUMERIC(10, 2) DEFAULT 0,
  coupon_code TEXT,
  shipping_fee NUMERIC(10, 2) DEFAULT 0,
  tax_total NUMERIC(10, 2) DEFAULT 0,
  grand_total NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Authorized', 'Paid', 'Failed', 'Partially Refunded', 'Refunded', 'Cancelled')),
  order_status TEXT DEFAULT 'New' CHECK (order_status IN ('New', 'Awaiting Confirmation', 'Confirmed', 'Processing', 'Packing', 'Ready for Dispatch', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Refunded')),
  shipping_status TEXT DEFAULT 'Unfulfilled',
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.7 ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sku TEXT,
  image TEXT,
  quantity INT NOT NULL CHECK (quantity > 0),
  mrp NUMERIC(10, 2) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  is_free_gift BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. HELPER FUNCTIONS & AUTH TRIGGER
-- ==============================================================================

-- 3.1 Check if current caller is an Admin or Master Owner
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('admin', 'manager') OR profiles.email = 'sutharpritesh7877@gmail.com')
    )
    OR
    (auth.jwt() ->> 'email') = 'sutharpritesh7877@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 Automatically Create Profile on Auth Signup / OTP Verification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT := 'customer';
BEGIN
  -- Automatically grant admin privileges to master owner
  IF NEW.email = 'sutharpritesh7877@gmail.com' THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4.1 PRODUCTS POLICIES:
-- Anyone can view active products.
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (status = 'Active' OR public.is_admin());

-- Only admins can create, update, delete products.
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (public.is_admin());

-- 4.2 CATEGORIES POLICIES:
-- Public can view active categories
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories
  FOR SELECT USING (active = true OR public.is_admin());

-- Admins can manage categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.3 SITE SETTINGS POLICIES:
-- Public can view site settings
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT USING (true);

-- Admins can update site settings
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.4 PROMOTIONS POLICIES:
-- Public can view active promotions
DROP POLICY IF EXISTS "Public can view promotions" ON public.promotions;
CREATE POLICY "Public can view promotions" ON public.promotions
  FOR SELECT USING (active = true OR public.is_admin());

-- Admins can manage promotions
DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;
CREATE POLICY "Admins can manage promotions" ON public.promotions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.5 PROFILES POLICIES:
-- Customers can view & update their own profile; admins can view all.
DROP POLICY IF EXISTS "Users can view own profile or admins all" ON public.profiles;
CREATE POLICY "Users can view own profile or admins all" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());

-- 4.6 ORDERS POLICIES:
-- Customers can view their own orders; admins can view all.
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Anyone can insert orders (guest checkout or authenticated checkout)
DROP POLICY IF EXISTS "Anyone can place order" ON public.orders;
CREATE POLICY "Anyone can place order" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Only admins can update orders (e.g. shipping status, order status)
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.7 ORDER ITEMS POLICIES:
-- Users can view items belonging to their own orders; admins can view all.
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 5. INITIAL SEED DATA
-- ==============================================================================

-- 5.1 DEFAULT SITE SETTINGS
INSERT INTO public.site_settings (id, store_name, legal_entity_name, brand_tagline, support_email, support_phone1, gstin, hero_headline, hero_subtitle, promo_banner_text)
VALUES (
  'default',
  'Duck Cosmetics',
  'Duck Care Private Limited',
  'Care for Every Little Moment',
  'crm@duckcosmetics.in',
  '+91 98250 10194',
  '24AAACD1234F1Z8',
  'Gentle daily care for your whole family.',
  'Thoughtfully crafted baby care, everyday cosmetics, soothing vapor balms, and herbal ortho oils. Made with plant-rich formulas and verified safety for Indian homes.',
  'Buy any cosmetic and unlock a free face wash (₹349 value)'
)
ON CONFLICT (id) DO NOTHING;

-- 5.2 DEFAULT CATEGORIES
INSERT INTO public.categories (name, tagline, image, tone, display_order, active)
VALUES
  ('Baby Care', 'Gentle from day one · Tear-free & pure', 'https://images.unsplash.com/photo-1686831889383-290d9bab10e6?w=800', 'bg-lilac', 1, true),
  ('Face Wash', 'Fresh, balanced skin · Aloe + green tea', 'https://images.unsplash.com/photo-1617858123189-b26eb62d8eb4?w=800', 'bg-mint', 2, true),
  ('Vapor Rub', 'Breathe easy comfort · Eucalyptus & mint', 'https://images.unsplash.com/photo-1671493234254-15fc6c91aa87?w=800', 'bg-sky', 3, true),
  ('Ortho Pain Oil', 'Herbal everyday relief · 12 botanical oils', 'https://images.unsplash.com/photo-1671493229066-f36e86b35841?w=800', 'bg-sage', 4, true),
  ('Cosmetics', 'Color that feels good · Skin tints & glow duos', 'https://images.unsplash.com/photo-1643168186368-c42359c82573?w=800', 'bg-blush', 5, true)
ON CONFLICT (name) DO NOTHING;

-- 5.3 DEFAULT PROMOTIONS (Buy Cosmetic, Get Free Face Wash)
INSERT INTO public.promotions (name, code, type, qualifying_category, gift_product_name, gift_max_quantity, active)
VALUES (
  'Buy Any Cosmetic, Get Free Face Wash',
  'FREEWASH',
  'free_gift',
  'Cosmetics',
  'Daily Fresh Face Wash',
  1,
  true
)
ON CONFLICT DO NOTHING;
