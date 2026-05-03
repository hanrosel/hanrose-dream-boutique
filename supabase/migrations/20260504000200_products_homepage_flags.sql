-- Add homepage placement flags to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS show_in_hero       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_in_collection BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_in_lookbook   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS link_url           TEXT;

-- Drop home_sections (no longer needed)
DROP TABLE IF EXISTS public.home_sections;
