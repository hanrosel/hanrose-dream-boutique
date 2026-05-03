import { Heart, Sparkles, Feather, Gem } from "lucide-react";

const items = [
  { icon: Heart, label: "Curated with Love" },
  { icon: Gem, label: "Premium Feel" },
  { icon: Feather, label: "Comfy for Kids" },
  { icon: Sparkles, label: "Limited Pieces" },
];

export const TrustStrip = () => (
  <section className="border-y border-border bg-white/60 backdrop-blur">
    <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-3 justify-center md:justify-start">
          <span className="h-10 w-10 rounded-full bg-pink-soft flex items-center justify-center">
            <Icon className="h-4 w-4 text-pink" strokeWidth={1.5} />
          </span>
          <span className="text-sm tracking-wide text-foreground/80">{label}</span>
        </div>
      ))}
    </div>
  </section>
);
