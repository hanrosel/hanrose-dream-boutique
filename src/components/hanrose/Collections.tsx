import { ArrowUpRight } from "lucide-react";
import { Placeholder } from "./Placeholder";

const collections = [
  { name: "Daily Wear", desc: "Soft, comfy, easy mix & match.", variant: "pink" as const, icon: "heart" as const },
  { name: "Dress & Occasion", desc: "Untuk birthday & photoshoot.", variant: "mixed" as const, icon: "crown" as const },
  { name: "Boys Collection", desc: "Cute, sharp, dan tetap cozy.", variant: "blue" as const, icon: "sparkles" as const },
  { name: "Preloved Gems", desc: "Curated finds, like new condition.", variant: "cream" as const, icon: "sparkles" as const },
];

export const Collections = () => (
  <section id="collections" className="container py-20 md:py-28">
    <div className="max-w-2xl">
      <span className="text-xs uppercase tracking-[0.3em] text-pink">Featured Collections</span>
      <h2 className="mt-3 font-serif text-4xl md:text-5xl">
        Pieces dipilih untuk <em className="text-blue not-italic">setiap momen</em>.
      </h2>
    </div>
    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {collections.map((c, i) => (
        <a
          key={c.name}
          href="#new"
          className="group relative overflow-hidden rounded-3xl bg-white shadow-card hover:shadow-elegant transition-smooth animate-fade-up"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <Placeholder label={`Foto ${c.name}`} variant={c.variant} icon={c.icon} className="aspect-[3/4]" />
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl">{c.name}</h3>
              <ArrowUpRight className="h-4 w-4 text-pink group-hover:rotate-12 transition-smooth" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
          </div>
        </a>
      ))}
    </div>
  </section>
);
