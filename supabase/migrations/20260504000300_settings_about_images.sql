-- About section images stored in site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS about_images TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS about_link_url TEXT;
