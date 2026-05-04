ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes'),
ADD COLUMN IF NOT EXISTS stock_released BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS stock_hold_status TEXT;

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
    stock_hold_status = CASE
      WHEN remaining_stock <= 0 AND status <> 'sold' THEN status
      ELSE stock_hold_status
    END,
    status = CASE WHEN remaining_stock <= 0 THEN 'sold' ELSE status END
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_order_stock(_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_released BOOLEAN;
  item RECORD;
BEGIN
  SELECT stock_released
  INTO already_released
  FROM public.orders
  WHERE id = _order_id
  FOR UPDATE;

  IF NOT FOUND OR already_released THEN
    RETURN;
  END IF;

  FOR item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = _order_id
      AND product_id IS NOT NULL
  LOOP
    UPDATE public.products
    SET
      stock = stock + item.quantity,
      status = CASE
        WHEN status = 'sold' AND stock_hold_status IS NOT NULL THEN stock_hold_status
        ELSE status
      END,
      stock_hold_status = CASE
        WHEN status = 'sold' AND stock_hold_status IS NOT NULL THEN NULL
        ELSE stock_hold_status
      END
    WHERE id = item.product_id;
  END LOOP;

  UPDATE public.orders
  SET stock_released = true
  WHERE id = _order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_stock_when_order_cancelled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    PERFORM public.release_order_stock(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_stock_before_order_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.release_order_stock(OLD.id);
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_release_stock_when_order_cancelled ON public.orders;
CREATE TRIGGER trg_release_stock_when_order_cancelled
AFTER UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.release_stock_when_order_cancelled();

DROP TRIGGER IF EXISTS trg_release_stock_before_order_delete ON public.orders;
CREATE TRIGGER trg_release_stock_before_order_delete
BEFORE DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.release_stock_before_order_delete();

CREATE OR REPLACE FUNCTION public.cancel_order_hold(_order_id UUID, _order_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed_count INT;
BEGIN
  UPDATE public.orders
  SET status = 'cancelled'
  WHERE id = _order_id
    AND order_code = _order_code
    AND status = 'pending_payment'
    AND stock_released = false;

  GET DIAGNOSTICS changed_count = ROW_COUNT;
  RETURN changed_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_order_hold(UUID, TEXT) TO anon, authenticated;
