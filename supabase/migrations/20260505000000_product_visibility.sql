-- Add visibility column to products table
ALTER TABLE public.products ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT true;

-- Create index for better query performance
CREATE INDEX idx_products_visible ON public.products(is_visible) WHERE is_visible = true;
