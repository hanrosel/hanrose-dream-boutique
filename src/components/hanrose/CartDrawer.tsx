import { Link, useLocation } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";

const formatPrice = (value: number | null | undefined) =>
  value ? `Rp ${value.toLocaleString("id-ID")}` : "Rp -";

export const CartDrawer = () => {
  const cart = useCart();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <>
      {cart.count > 0 && (
        <button
          onClick={cart.openCart}
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-elegant transition-smooth hover:scale-105"
          aria-label="Open cart"
        >
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-pink px-1 text-xs font-medium text-foreground">
            {cart.count}
          </span>
        </button>
      )}

      <Sheet open={cart.isOpen} onOpenChange={(open) => (open ? cart.openCart() : cart.closeCart())}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b px-5 py-4 text-left">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-serif text-2xl">Cart</SheetTitle>
              <button onClick={cart.closeCart} className="rounded-full p-2 hover:bg-muted" aria-label="Close cart">
                <X className="h-4 w-4" />
              </button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-auto px-5 py-4">
            {cart.items.length ? (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[72px_1fr] gap-3 rounded-2xl border bg-white p-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-20 w-[72px] rounded-xl object-cover" />
                    ) : (
                      <div className="h-20 w-[72px] rounded-xl bg-pink-soft" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif text-lg leading-tight">{item.name}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                        </div>
                        <button
                          onClick={() => cart.removeItem(item.id)}
                          className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                        <Input
                          value={item.selectedSize}
                          onChange={(e) => cart.updateItem(item.id, { selectedSize: e.target.value })}
                          placeholder="Size"
                          className="h-9 rounded-full"
                        />
                        <div className="flex h-9 items-center rounded-full border bg-background">
                          <button
                            onClick={() => cart.updateItem(item.id, { quantity: item.quantity - 1 })}
                            className="px-2"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => cart.updateItem(item.id, { quantity: item.quantity + 1 })}
                            className="px-2"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingBag className="h-10 w-10 text-pink" />
                <p className="mt-3 font-serif text-2xl">Cart masih kosong.</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Pilih piece favorit si kecil dulu, nanti checkout tanpa login.
                </p>
              </div>
            )}
          </div>

          <div className="border-t bg-background p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-serif text-2xl">{formatPrice(cart.subtotal)}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Ongkir dan ketersediaan size dikonfirmasi admin sebelum pembayaran diproses.
            </p>
            <Button asChild variant="hanrose" size="lg" className="mt-4 w-full" disabled={!cart.items.length}>
              <Link to="/checkout" onClick={cart.closeCart}>
                Checkout
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
