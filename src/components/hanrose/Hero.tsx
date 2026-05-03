import { Sparkles, MessageCircle, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Placeholder } from "./Placeholder";
import { SimpleSlider } from "./SimpleSlider";
import { useSiteSettings, buildWaLink } from "@/hooks/useSiteSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Hero = () => {
  const { data: s } = useSiteSettings();
  const wa = buildWaLink(s);

  const { data: products = [] } = useQuery({
    queryKey: ["hero_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,images,link_url")
        .eq("show_in_hero", true)
        .order("sort_order");
      if (error) throw error;
      return data as { id: string; name: string; images: string[]; link_url: string | null }[];
    },
    staleTime: 60_000,
  });

  // Flatten all images from all hero products into one slide list
  // Each image carries its own link_url from the product
  const slides = products.flatMap((p) =>
    (p.images ?? []).map((img) => ({ src: img, link: p.link_url }))
  );

  return (
    <section id="top" className="relative overflow-hidden bg-gradient-hero pt-32 pb-20 md:pt-40 md:pb-28">
      <Sparkles className="absolute top-32 left-10 h-5 w-5 text-pink/60 animate-sparkle" />
      <Sparkles className="absolute top-48 right-16 h-4 w-4 text-blue animate-sparkle" style={{ animationDelay: "1s" }} />
      <Crown className="absolute bottom-16 left-1/4 h-6 w-6 text-pink/40 animate-float" strokeWidth={1.2} />

      <div className="container grid lg:grid-cols-2 gap-12 items-center relative">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-xs tracking-[0.25em] uppercase text-foreground/70 shadow-soft">
            <Sparkles className="h-3 w-3 text-pink" /> Premium Kidswear Boutique
          </span>
          <h1 className="mt-6 font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground">
            Premium Kidswear for{" "}
            <em className="text-pink not-italic">Little Moments</em>{" "}
            That <span className="text-blue">Matter</span>.
          </h1>
          <p className="mt-6 max-w-lg text-base md:text-lg text-muted-foreground leading-relaxed">
            Baju anak premium, comfy, dan aesthetic untuk daily wear, photoshoot,
            birthday, dan special occasion. Dipilih dengan cinta untuk si kecil.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hanrose" size="xl">
              <a href="#new">Shop New Arrivals <ArrowRight className="h-4 w-4" /></a>
            </Button>
            <Button asChild variant="hanroseOutline" size="xl">
              <a href={wa} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> Chat via WhatsApp
              </a>
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <div>
              <div className="font-serif text-2xl text-foreground">500+</div>
              <div className="tracking-wider uppercase">Happy Little Ones</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="font-serif text-2xl text-foreground">100%</div>
              <div className="tracking-wider uppercase">Curated Quality</div>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-pink/40 blur-2xl" />
          <div className="absolute -bottom-8 -right-4 h-32 w-32 rounded-full bg-blue/40 blur-2xl" />

          {slides.length > 0 ? (
            <SimpleSlider
              slides={slides}
              className="aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-elegant"
            />
          ) : (
            <Placeholder label="Foto Lookbook — Hero" variant="mixed" icon="crown" className="aspect-[4/5] w-full shadow-elegant" />
          )}

          <div className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur px-4 py-3 shadow-soft border border-white">
            <span className="h-10 w-10 rounded-full bg-gradient-pink-blue flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <div>
              <div className="font-serif text-sm">New Drop</div>
              <div className="text-xs text-muted-foreground">Limited pieces ✿</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
