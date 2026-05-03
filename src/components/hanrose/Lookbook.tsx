import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SimpleSlider } from "./SimpleSlider";
import { Placeholder } from "./Placeholder";

const VARIANTS = ["pink", "blue", "mixed", "cream"] as const;

export const Lookbook = () => {
  const { data: products = [] } = useQuery({
    queryKey: ["lookbook_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,images,link_url,sort_order")
        .eq("show_in_lookbook", true)
        .order("sort_order")
        .limit(4);
      if (error) throw error;
      return data as { id: string; name: string; images: string[]; link_url: string | null }[];
    },
    staleTime: 60_000,
  });

  // Always show 4 slots
  const slots = Array.from({ length: 4 }, (_, i) => products[i] ?? null);

  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-pink">Lookbook</span>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            As seen on <em className="text-blue not-italic">@hanrose.atelier</em>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Inspirasi outfit harian si kecil dari komunitas Hanrose.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:gap-5 max-w-2xl mx-auto">
          {slots.map((p, i) => (
            <div key={i} className="rounded-3xl overflow-hidden aspect-square">
              {p && p.images?.length > 0 ? (
                <SimpleSlider
                  images={p.images}
                  linkUrl={p.link_url}
                  className="w-full h-full"
                />
              ) : (
                <Placeholder
                  label={p?.name ?? `Lookbook ${i + 1}`}
                  variant={VARIANTS[i]}
                  icon="sparkles"
                  className="w-full h-full"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
