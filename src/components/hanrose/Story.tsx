import { Sparkles } from "lucide-react";
import { Placeholder } from "./Placeholder";

export const Story = () => (
  <section id="about" className="bg-gradient-soft py-20 md:py-28">
    <div className="container grid lg:grid-cols-2 gap-12 items-center">
      <div className="relative order-2 lg:order-1">
        <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-pink/30 blur-2xl" />
        <Placeholder
          label="Foto Owner / Brand Story"
          variant="cream"
          icon="heart"
          className="aspect-[4/5] max-w-md mx-auto shadow-elegant"
        />
      </div>
      <div className="order-1 lg:order-2">
        <span className="text-xs uppercase tracking-[0.3em] text-pink">Our Story</span>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl leading-tight">
          Lahir dari cinta untuk <em className="text-pink not-italic">si kecil</em>.
        </h2>
        <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Hanrose Atelier terinspirasi dari momen-momen kecil yang berharga
            bersama buah hati. Kami percaya setiap anak pantas memakai pakaian
            yang nyaman, berkualitas, dan penuh detail cantik.
          </p>
          <p>
            Diciptakan untuk para mama yang mencintai quality, comfort, dan
            aesthetic — setiap piece dikurasi dengan teliti, dari bahan yang
            lembut hingga jahitan yang rapi.
          </p>
          <p className="font-serif italic text-foreground/80 text-lg">
            “Karena setiap momen kecil mereka, layak dirayakan.” <Sparkles className="inline h-4 w-4 text-pink" />
          </p>
        </div>
        <div className="mt-8 flex gap-8">
          <div>
            <div className="font-serif text-3xl text-pink">2024</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Established</div>
          </div>
          <div>
            <div className="font-serif text-3xl text-blue">100%</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Hand Curated</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
