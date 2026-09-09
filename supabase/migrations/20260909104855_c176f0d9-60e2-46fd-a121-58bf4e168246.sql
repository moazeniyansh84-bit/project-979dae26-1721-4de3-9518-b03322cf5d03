CREATE TABLE public.settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.settings TO anon;
GRANT SELECT ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable" ON public.settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


CREATE TABLE public.shipping_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  province TEXT,
  city TEXT,
  region TEXT,
  cost INTEGER NOT NULL DEFAULT 0,
  free_threshold INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shipping_rates TO anon;
GRANT SELECT ON public.shipping_rates TO authenticated;
GRANT ALL ON public.shipping_rates TO service_role;

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shipping rates are publicly readable" ON public.shipping_rates
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage shipping rates" ON public.shipping_rates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  address TEXT NOT NULL,
  building_number TEXT,
  unit TEXT,
  postal_code TEXT,
  shipping_cost INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.orders TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place an order" ON public.orders
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.order_items TO anon;
GRANT INSERT ON public.order_items TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can add order items" ON public.order_items
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


CREATE TRIGGER settings_updated BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER shipping_rates_updated BEFORE UPDATE ON public.shipping_rates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


INSERT INTO public.settings (key, value) VALUES
  ('business_hours', 'شنبه تا پنجشنبه، ۱۰ صبح تا ۶ عصر'),
  ('website_url', 'www.takshakhkids.ir'),
  ('free_shipping_threshold', '2000000')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.shipping_rates (label, province, city, region, cost, free_threshold, sort_order, is_default) VALUES
  ('تهران', 'تهران', 'تهران', NULL, 75000, 2000000, 1, false),
  ('سایر شهرها', NULL, NULL, NULL, 90000, 3000000, 2, true)
ON CONFLICT DO NOTHING;