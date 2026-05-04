ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sizes TEXT[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.reserve_order_item_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p_stock INT;
  p_status TEXT;
  p_sizes TEXT[];
  remaining_stock INT;
BEGIN
  IF NEW.product_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT stock, status, sizes
  INTO p_stock, p_status, p_sizes
  FROM public.products
  WHERE id = NEW.product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produk tidak ditemukan.';
  END IF;

  IF p_status = 'sold' OR p_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Produk % sudah sold out atau stok tidak cukup.', NEW.product_name;
  END IF;

  IF COALESCE(array_length(p_sizes, 1), 0) > 0 THEN
    IF NEW.selected_size IS NULL OR NEW.selected_size = '' OR NOT (NEW.selected_size = ANY(p_sizes)) THEN
      RAISE EXCEPTION 'Size untuk produk % tidak valid.', NEW.product_name;
    END IF;
  END IF;

  remaining_stock := p_stock - NEW.quantity;

  UPDATE public.products
  SET
    stock = remaining_stock,
    status = CASE WHEN remaining_stock <= 0 THEN 'sold' ELSE status END
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reserve_order_item_stock ON public.order_items;
CREATE TRIGGER trg_reserve_order_item_stock
BEFORE INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.reserve_order_item_stock();
