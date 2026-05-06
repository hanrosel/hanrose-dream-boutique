import { useState } from "react";
import { Mail, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { WA_LINK } from "@/lib/hanrose";

export const Newsletter = () => {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({ title: "Terima kasih ✿", description: "Kamu akan menerima update Hanrose terbaru." });
    setEmail("");
  };

  return (
    <section className="container py-20 md:py-28">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-pink-blue p-10 md:p-16 text-center shadow-elegant">
        <Sparkles className="absolute top-6 left-8 h-5 w-5 text-white/70 animate-sparkle" />
        <Sparkles className="absolute bottom-6 right-10 h-4 w-4 text-white/70 animate-sparkle" style={{ animationDelay: "1.2s" }} />
        <h2 className="font-serif text-4xl md:text-5xl text-white">Join Hanrose Updates</h2>
        <p className="mt-3 text-white/90 max-w-md mx-auto text-sm">
          Be the first to know about new drops, restocks, dan koleksi terbaru kami.
        </p>
        <form onSubmit={submit} className="mt-8 mx-auto max-w-md flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
            <Input
              type="email"
              required
              placeholder="email@kamu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 pl-11 rounded-full border-0 bg-white/95"
            />
          </div>
          <Button type="submit" size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            Subscribe
          </Button>
        </form>
        <div className="mt-6 text-white/80 text-xs">— atau —</div>
        <Button asChild variant="whatsapp" size="lg" className="mt-4">
          <a href={WA_LINK} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" /> Join WhatsApp Community
          </a>
        </Button>
      </div>
    </section>
  );
};
