import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Placeholder } from "./Placeholder";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSiteSettings, buildWaLink } from "@/hooks/useSiteSettings";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  badge: string | null;
  status: string;
  images: string[];
};

const variantFromStatus = (s: string): "pink" | "blue" | "mixed" | "cream" => {
  if (s === "limited") return "mixed";
  if (s === "preloved") return "cream";
  return "pink";
};
const badgeClass = (b: string | null) => {
  const x = (b ?? "").toLowerCase();
  if (x.includes("limited")) return "bg-foreground text-background";
  if (x.includes("preloved")) return "bg-blue text-secondary-foreground";
  return "bg-pink text-primary-foreground";
};

export const Products = () => {
  const [active, setActive] = useState<Product | null>(null);
  const { data: settings } = useSiteSettings();
  const { data: products = [] } = useQuery({
    queryKey: ["home_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,description,price,badge,status,images")
        .eq("featured", true)
        .order("sort_order")
        .limit(12);
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <section id="new" className="container py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-pink">New Arrivals</span>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            Fresh pieces, <em className="text-blue not-italic">just dropped</em>.
          </h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm">
          Stok terbatas. Chat WhatsApp untuk detail size, kondisi, dan ketersediaan.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {products.map((p, i) => (
          <article
            key={p.id}
            className="group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="relative">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} loading="lazy" className="aspect-square w-full object-cover" />
              ) : (
                <Placeholder label={`Foto — ${p.name}`} variant={variantFromStatus(p.status)} icon="sparkles" className="aspect-square" />
              )}
              {p.badge && (
                <span className={`absolute top-4 left-4 rounded-full px-3 py-1 text-[0.65rem] tracking-wider uppercase ${badgeClass(p.badge)}`}>
                  {p.badge}
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-serif text-xl">{p.name}</h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{p.price ? `Rp ${p.price.toLocaleString("id-ID")}` : "Rp —"}</span>
                <Sparkles className="h-3 w-3 text-pink" />
              </div>
              <Button
                onClick={() => setActive(p)}
                variant="hanroseOutline"
                className="mt-4 w-full"
                size="sm"
              >
                <MessageCircle className="h-4 w-4" /> Detail via WhatsApp
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden border-0">
          {active && (
            <div>
              {active.images?.[0] ? (
                <img src={active.images[0]} alt={active.name} className="aspect-square w-full object-cover" />
              ) : (
                <Placeholder label={`Foto — ${active.name}`} variant={variantFromStatus(active.status)} icon="crown" className="aspect-square rounded-none" />
              )}
              <button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-soft"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="p-6">
                {active.badge && (
                  <span className={`inline-block rounded-full px-3 py-1 text-[0.65rem] tracking-wider uppercase ${badgeClass(active.badge)}`}>
                    {active.badge}
                  </span>
                )}
                <h3 className="mt-3 font-serif text-3xl">{active.name}</h3>
                <p className="mt-1 text-muted-foreground">{active.price ? `Rp ${active.price.toLocaleString("id-ID")}` : "Rp —"}</p>
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
                    <div className="mt-1 text-foreground/70">1 — 8 tahun</div>
                  </div>
                </div>
                <Button asChild variant="whatsapp" className="mt-6 w-full" size="lg">
                  <a href={buildWaLink(settings, active.name)} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" /> Order via WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
