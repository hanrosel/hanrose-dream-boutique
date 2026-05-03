import { useState } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Placeholder } from "./Placeholder";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { waLink } from "@/lib/hanrose";

type Product = {
  name: string;
  price: string;
  badge: "New" | "Limited" | "Preloved Like New";
  variant: "pink" | "blue" | "mixed" | "cream";
};

const products: Product[] = [
  { name: "Rosie Tulle Dress", price: "Rp —", badge: "New", variant: "pink" },
  { name: "Hugo Linen Set", price: "Rp —", badge: "New", variant: "blue" },
  { name: "Daisy Knit Cardigan", price: "Rp —", badge: "Limited", variant: "cream" },
  { name: "Petit Bow Blouse", price: "Rp —", badge: "Preloved Like New", variant: "pink" },
  { name: "Cloud Pajama Set", price: "Rp —", badge: "New", variant: "blue" },
  { name: "Belle Occasion Gown", price: "Rp —", badge: "Limited", variant: "mixed" },
];

const badgeStyle: Record<Product["badge"], string> = {
  New: "bg-pink text-primary-foreground",
  Limited: "bg-foreground text-background",
  "Preloved Like New": "bg-blue text-secondary-foreground",
};

export const Products = () => {
  const [active, setActive] = useState<Product | null>(null);

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

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <article
            key={p.name}
            className="group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="relative">
              <Placeholder
                label={`Foto Produk — ${p.name}`}
                variant={p.variant}
                icon="sparkles"
                className="aspect-square"
              />
              <span className={`absolute top-4 left-4 rounded-full px-3 py-1 text-[0.65rem] tracking-wider uppercase ${badgeStyle[p.badge]}`}>
                {p.badge}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-serif text-xl">{p.name}</h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{p.price}</span>
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
              <Placeholder
                label={`Foto Produk — ${active.name}`}
                variant={active.variant}
                icon="crown"
                className="aspect-square rounded-none"
              />
              <button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-soft"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="p-6">
                <span className={`inline-block rounded-full px-3 py-1 text-[0.65rem] tracking-wider uppercase ${badgeStyle[active.badge]}`}>
                  {active.badge}
                </span>
                <h3 className="mt-3 font-serif text-3xl">{active.name}</h3>
                <p className="mt-1 text-muted-foreground">{active.price}</p>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  Premium quality, lembut di kulit, dan dijahit dengan rapi.
                  Cocok untuk daily wear maupun moment spesial. Tersedia size
                  terbatas — chat kami untuk konfirmasi ketersediaan dan detail kondisi.
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
                  <a href={waLink(active.name)} target="_blank" rel="noreferrer">
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
