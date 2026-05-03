import { Instagram } from "lucide-react";
import { Placeholder } from "./Placeholder";

const items = [
  { v: "pink", c: "Daily soft pink ootd" },
  { v: "blue", c: "Sunday brunch look" },
  { v: "mixed", c: "Birthday in tulle" },
  { v: "cream", c: "Cozy weekend" },
  { v: "pink", c: "Photoshoot mood" },
  { v: "blue", c: "Little gentleman" },
] as const;

export const Lookbook = () => (
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
      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {items.map((it, i) => (
          <div key={i} className="group relative">
            <Placeholder
              label={it.c}
              variant={it.v}
              icon="sparkles"
              className="aspect-square"
            />
            <div className="absolute inset-0 rounded-3xl bg-foreground/0 group-hover:bg-foreground/30 transition-smooth flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Instagram className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
