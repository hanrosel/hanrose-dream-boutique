-- Add multi-image support to home_sections
ALTER TABLE public.home_sections ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

-- Add screenshot support to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS screenshot TEXT[] NOT NULL DEFAULT '{}';
