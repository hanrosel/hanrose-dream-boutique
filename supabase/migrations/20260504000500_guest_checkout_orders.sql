CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  notes TEXT,
  subtotal INT NOT NULL DEFAULT 0,
  shipping_fee INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  payment_proof TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price INT NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  selected_size TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_orders_updated
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_order_items_order_id ON public.order_items (order_id);

CREATE POLICY "orders public insert" ON public.orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "order items public insert" ON public.order_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "orders admin manage" ON public.orders
FOR ALL USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "order items admin manage" ON public.order_items
FOR ALL USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
