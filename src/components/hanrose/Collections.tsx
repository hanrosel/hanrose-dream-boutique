import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Placeholder } from "./Placeholder";
import { SimpleSlider } from "./SimpleSlider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type P = { id: string; name: string; images: string[]; link_url: string | null; sort_order: number };

const VARIANTS = ["pink", "mixed", "blue", "cream", "pink", "mixed", "blue", "cream"] as const;
const ICONS    = ["heart", "crown", "sparkles", "sparkles", "heart", "crown", "sparkles", "sparkles"] as const;

export const Collections = () => {
  const { data: products = [] } = useQuery({
    queryKey: ["collection_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,images,link_url,sort_order")
        .eq("show_in_collection", true)
        .order("sort_order");
      if (error) throw error;
      return data as P[];
    },
    staleTime: 60_000,
  });

  const visible = products.slice(0, 8);
  const hasMore = products.length > 8;

  return (
    <section id="collections" className="container py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] text-pink">Featured Collections</span>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            Pieces dipilih untuk <em className="text-blue not-italic">setiap momen</em>.
          </h2>
        </div>
        <Button asChild variant="hanroseOutline" size="sm">
          <Link to="/collections">Lihat Semua <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {visible.length > 0
          ? visible.map((p, i) => (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-card hover:shadow-elegant transition-smooth animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {p.images?.length > 0 ? (
                  <SimpleSlider
                    images={p.images}
                    linkUrl={p.link_url}
                    className="aspect-[3/4]"
                    dots={p.images.length > 1}
                  />
                ) : (
                  <a href={p.link_url ?? "#collections"}>
                    <Placeholder label={p.name} variant={VARIANTS[i % 8]} icon={ICONS[i % 8]} className="aspect-[3/4]" />
                  </a>
                )}
                <a href={p.link_url ?? "#collections"} className="block p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl">{p.name}</h3>
                    <ArrowUpRight className="h-4 w-4 text-pink group-hover:rotate-12 transition-smooth" />
                  </div>
                </a>
              </div>
            ))
          : /* fallback placeholders */
            (["Daily Wear", "Dress & Occasion", "Boys Collection", "Preloved Gems"] as const).map((name, i) => (
              <div key={name} className="group overflow-hidden rounded-3xl bg-white shadow-card animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <Placeholder label={`Foto ${name}`} variant={VARIANTS[i]} icon={ICONS[i]} className="aspect-[3/4]" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl">{name}</h3>
                    <ArrowUpRight className="h-4 w-4 text-pink" />
                  </div>
                </div>
              </div>
            ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <Button asChild variant="hanrose">
            <Link to="/collections">Lihat Semua Koleksi <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      )}
    </section>
  );
};
