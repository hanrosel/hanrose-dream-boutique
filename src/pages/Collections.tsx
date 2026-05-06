import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Sparkles, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Placeholder } from "@/components/hanrose/Placeholder";
import { SimpleSlider } from "@/components/hanrose/SimpleSlider";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Navbar } from "@/components/hanrose/Navbar";
import { Footer } from "@/components/hanrose/Footer";
import { FloatingWA } from "@/components/hanrose/FloatingWA";
import { useSiteSettings, buildWaLink } from "@/hooks/useSiteSettings";
import { X } from "lucide-react";
import { useCart } from "@/hooks/useCart";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  badge: string | null;
  status: string;
  images: string[];
  stock: number;
  sizes: string[];
};

const PAGE_SIZE = 50;

const badgeClass = (b: string | null) => {
  const x = (b ?? "").toLowerCase();
  if (x.includes("sold")) return "bg-foreground text-background border-white/70";
  if (x.includes("limited")) return "bg-foreground text-background border-white/70";
  return "bg-white/95 text-foreground border-pink/40 shadow-soft";
};

const variantFromStatus = (s: string): "pink" | "blue" | "mixed" | "cream" => {
  if (s === "limited") return "mixed";
  return "pink";
};

export default function CollectionsPage() {
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Product | null>(null);
  const { data: settings } = useSiteSettings();
  const cart = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ["collections_page", page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from("products")
        .select("id,name,description,price,badge,status,images,stock,sizes", { count: "exact" })
        .eq("is_visible" as any, true)
        .order("sort_order")
        .range(from, to);
      if (error) throw error;
      return { products: data as Product[], total: count ?? 0 };
    },
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const toCartProduct = (p: Product) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.images?.[0],
    sizes: p.sizes ?? [],
    stock: p.stock,
    status: p.status,
  });
  const isAvailable = (p: Product) => p.status !== "sold" && p.stock > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-32 pb-20">
        <div className="mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-pink">Koleksi</span>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">
            Semua <em className="text-blue not-italic">Koleksi</em>.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{total} produk tersedia</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-muted animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {products.map((p, i) => (
              <article
                key={p.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth animate-fade-up cursor-pointer"
                style={{ animationDelay: `${i * 0.03}s` }}
                onClick={() => setActive(p)}
              >
                <div className="relative">
                  {p.images?.length > 0 ? (
                    <SimpleSlider
                      images={p.images}
                      className="aspect-[3/4] w-full"
                      dots={p.images.length > 1}
                    />
                  ) : (
                    <Placeholder
                      label={p.name}
                      variant={variantFromStatus(p.status)}
                      icon="sparkles"
                      className="aspect-[3/4]"
                    />
                  )}
                  {(p.badge || !isAvailable(p)) && (
                    <span className={`absolute top-3 left-3 rounded-full border px-2.5 py-0.5 text-[0.6rem] tracking-wider uppercase ${badgeClass(!isAvailable(p) ? "sold" : p.badge)}`}>
                      {!isAvailable(p) ? "Sold out" : p.badge}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-base leading-tight">{p.name}</h3>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {p.price ? `Rp ${p.price.toLocaleString("id-ID")}` : "Rp —"}
                    </span>
                    <Sparkles className="h-3 w-3 text-pink" />
                  </div>
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      cart.addItem(toCartProduct(p));
                    }}
                    variant="hanroseOutline"
                    size="sm"
                    className="mt-3 w-full"
                    disabled={!isAvailable(p)}
                  >
                    <ShoppingBag className="h-4 w-4" /> {isAvailable(p) ? "Add" : "Sold"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      {/* Product detail dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden border-0">
          {active && (
            <div>
              {active.images?.length > 0 ? (
                <SimpleSlider images={active.images} className="aspect-square w-full" />
              ) : (
                <Placeholder label={active.name} variant={variantFromStatus(active.status)} icon="crown" className="aspect-square rounded-none" />
              )}
              <button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-soft"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="p-6">
                {(active.badge || !isAvailable(active)) && (
                  <span className={`inline-block rounded-full border px-3 py-1 text-[0.65rem] tracking-wider uppercase ${badgeClass(!isAvailable(active) ? "sold" : active.badge)}`}>
                    {!isAvailable(active) ? "Sold out" : active.badge}
                  </span>
                )}
                <h3 className="mt-3 font-serif text-3xl">{active.name}</h3>
                <p className="mt-1 text-muted-foreground">
                  {active.price ? `Rp ${active.price.toLocaleString("id-ID")}` : "Rp —"}
                </p>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {active.description ?? "Premium quality, lembut di kulit, dan dijahit dengan rapi."}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-pink-soft p-3">
                    <div className="uppercase tracking-wider text-pink">Material</div>
                    <div className="mt-1 text-foreground/70">Premium soft cotton blend</div>
                  </div>
                  <div className="rounded-2xl bg-blue-soft p-3">
                    <div className="uppercase tracking-wider text-blue">Size</div>
                    <div className="mt-1 text-foreground/70">
                      {active.sizes?.length ? active.sizes.join(", ") : "Tanya admin"}
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Button
                    onClick={() => cart.addItem(toCartProduct(active))}
                    variant="hanrose"
                    size="lg"
                    disabled={!isAvailable(active)}
                  >
                    <ShoppingBag className="h-4 w-4" /> {isAvailable(active) ? "Add to cart" : "Sold out"}
                  </Button>
                  <Button asChild variant="whatsapp" size="lg">
                    <a href={buildWaLink(settings, active.name)} target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <FloatingWA />
    </div>
  );
}
