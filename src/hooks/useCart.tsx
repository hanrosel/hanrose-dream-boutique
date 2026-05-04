import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartProduct = {
  id: string;
  name: string;
  price: number | null;
  image?: string | null;
  sizes?: string[];
  stock?: number;
  status?: string;
};

export type CartItem = CartProduct & {
  quantity: number;
  selectedSize: string;
  notes: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (product: CartProduct) => void;
  updateItem: (id: string, patch: Partial<Pick<CartItem, "quantity" | "selectedSize" | "notes">>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const STORAGE_KEY = "hanrose_cart";
const CartContext = createContext<CartContextValue | null>(null);

const readCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(readCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

    return {
      items,
      count,
      subtotal,
      isOpen,
      addItem: (product) => {
        setItems((current) => {
          const existing = current.find((item) => item.id === product.id);
          if (existing) {
            return current.map((item) =>
              item.id === product.id
                ? { ...item, quantity: Math.min(item.quantity + 1, product.stock ?? item.stock ?? item.quantity + 1) }
                : item,
            );
          }
          return [
            ...current,
            {
              ...product,
              sizes: product.sizes ?? [],
              stock: product.stock ?? 0,
              status: product.status ?? "new",
              quantity: 1,
              selectedSize: product.sizes?.length === 1 ? product.sizes[0] : "",
              notes: "",
            },
          ];
        });
        setIsOpen(true);
      },
      updateItem: (id, patch) => {
        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...patch,
                  quantity: Math.min(Math.max(1, patch.quantity ?? item.quantity), item.stock || patch.quantity || item.quantity),
                }
              : item,
          ),
        );
      },
      removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      clearCart: () => setItems([]),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [isOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
