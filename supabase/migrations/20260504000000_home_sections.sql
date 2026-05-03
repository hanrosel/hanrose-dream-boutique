-- Home sections: Hero, Collections, About, Lookbook
CREATE TABLE public.home_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,        -- 'hero' | 'collection' | 'about' | 'lookbook'
  label TEXT NOT NULL,          -- display label / caption
  image_url TEXT,               -- foto
  link_url TEXT,                -- URL tujuan saat foto diklik
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_home_sections_updated BEFORE UPDATE ON public.home_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "home_sections public read" ON public.home_sections FOR SELECT USING (true);
CREATE POLICY "home_sections admin write" ON public.home_sections FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default rows
INSERT INTO public.home_sections (section, label, sort_order) VALUES
  ('hero',       'Hero Image',           0),
  ('collection', 'Daily Wear',           0),
  ('collection', 'Dress & Occasion',     1),
  ('collection', 'Boys Collection',      2),
  ('collection', 'Preloved Gems',        3),
  ('about',      'About / Brand Story',  0),
  ('lookbook',   'Daily soft pink ootd', 0),
  ('lookbook',   'Sunday brunch look',   1),
  ('lookbook',   'Birthday in tulle',    2),
  ('lookbook',   'Cozy weekend',         3),
  ('lookbook',   'Photoshoot mood',      4),
  ('lookbook',   'Little gentleman',     5);
