CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  price integer NOT NULL DEFAULT 0,
  discount_percent integer NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  gender text NOT NULL DEFAULT 'unisex',
  age_group text NOT NULL DEFAULT 'kids',
  sizes text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('لباس دخترانه','girls-clothing',1),
  ('لباس پسرانه','boys-clothing',2),
  ('کیف','bags',3),
  ('کش مو','hair-ties',4),
  ('اکسسوری','accessories',5);

INSERT INTO public.products (name, description, category_id, price, discount_percent, stock, gender, age_group, sizes, images, is_featured)
VALUES
('تیشرت دخترانه طرح تک شاخ','تیشرت نخی نرم با چاپ تک شاخ، مناسب بهار و تابستان.',(SELECT id FROM public.categories WHERE slug='girls-clothing'),320000,20,14,'girl','kids','{"2-3","4-5","6-7","8-9"}','{"/__l5e/assets-v1/6361e5c8-2304-47e1-9853-add4c9d6e6f3/product-1.jpg"}',true),
('ست تیشرت و شلوارک دخترانه','ست دو تکه راحت با پارچه نخی درجه یک.',(SELECT id FROM public.categories WHERE slug='girls-clothing'),480000,15,9,'girl','kids','{"4-5","6-7","8-9"}','{"/__l5e/assets-v1/6361e5c8-2304-47e1-9853-add4c9d6e6f3/product-1.jpg"}',false),
('تونیک دخترانه صورتی','تونیک خنک با یقه گرد و طرح ساده.',(SELECT id FROM public.categories WHERE slug='girls-clothing'),395000,0,20,'girl','teen','{"10-11","12-13"}','{"/__l5e/assets-v1/6361e5c8-2304-47e1-9853-add4c9d6e6f3/product-1.jpg"}',true),
('ست تیشرت سفید و شلوارک جین پسرانه','ست خوش‌دوخت با جین نرم و تیشرت نخی.',(SELECT id FROM public.categories WHERE slug='boys-clothing'),520000,25,11,'boy','kids','{"2-3","4-5","6-7"}','{"/__l5e/assets-v1/20c0df5a-19df-4d97-89fc-0aac5b4d8411/product-2.jpg"}',true),
('شلوارک جین پسرانه','شلوارک جین با کمر کشی و جیب‌دار.',(SELECT id FROM public.categories WHERE slug='boys-clothing'),340000,0,18,'boy','kids','{"4-5","6-7","8-9"}','{"/__l5e/assets-v1/20c0df5a-19df-4d97-89fc-0aac5b4d8411/product-2.jpg"}',false),
('تیشرت ساده پسرانه','تیشرت پایه سفید، مناسب هر استایلی.',(SELECT id FROM public.categories WHERE slug='boys-clothing'),245000,10,30,'boy','teen','{"10-11","12-13","14-15"}','{"/__l5e/assets-v1/20c0df5a-19df-4d97-89fc-0aac5b4d8411/product-2.jpg"}',false),
('کوله پشتی تک شاخ یاسی','کوله سبک با آویز تک شاخ، مناسب مهد و مدرسه.',(SELECT id FROM public.categories WHERE slug='bags'),690000,30,7,'girl','kids','{"تک سایز"}','{"/__l5e/assets-v1/92f945d6-005d-496f-b5f2-0add629f00ae/product-3.jpg"}',true),
('کوله مدرسه نوجوان','کوله بادوام با جیب لپ‌تاپ و بند اسفنجی.',(SELECT id FROM public.categories WHERE slug='bags'),880000,0,12,'unisex','teen','{"تک سایز"}','{"/__l5e/assets-v1/92f945d6-005d-496f-b5f2-0add629f00ae/product-3.jpg"}',false),
('پک کش مو رنگی (۴ عددی)','کش موی پارچه‌ای نرم بدون آسیب به مو.',(SELECT id FROM public.categories WHERE slug='hair-ties'),120000,20,45,'girl','kids','{"تک سایز"}','{"/__l5e/assets-v1/c301c8f9-cb17-49da-b9bb-5a5605d5d5d3/product-4.jpg"}',true),
('پک کش مو پاستیلی (۶ عددی)','ترکیب رنگ‌های پاستیلی برای هر روز هفته.',(SELECT id FROM public.categories WHERE slug='hair-ties'),165000,10,38,'girl','teen','{"تک سایز"}','{"/__l5e/assets-v1/c301c8f9-cb17-49da-b9bb-5a5605d5d5d3/product-4.jpg"}',false),
('گیره مو پاپیونی','گیره سبک با پاپیون پارچه‌ای.',(SELECT id FROM public.categories WHERE slug='accessories'),95000,0,50,'girl','kids','{"تک سایز"}','{"/__l5e/assets-v1/c301c8f9-cb17-49da-b9bb-5a5605d5d5d3/product-4.jpg"}',false),
('ست اکسسوری مو تک شاخ','شامل گیره، کش مو و هدبند با تم تک شاخ.',(SELECT id FROM public.categories WHERE slug='accessories'),210000,35,16,'girl','kids','{"تک سایز"}','{"/__l5e/assets-v1/c301c8f9-cb17-49da-b9bb-5a5605d5d5d3/product-4.jpg"}',true);