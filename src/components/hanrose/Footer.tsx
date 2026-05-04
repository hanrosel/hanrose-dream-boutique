import { Instagram, MessageCircle, Mail, Heart, ShoppingBag, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings, buildWaLink } from "@/hooks/useSiteSettings";
import logo from "@/assets/hanrose-logo.png";

export const Footer = () => {
  const { data: s } = useSiteSettings();
  const wa = buildWaLink(s);
  const email = s?.email ?? "hello@hanrose.id";
  const socials = [
    { url: s?.instagram_url, icon: Instagram, label: "Instagram" },
    { url: wa, icon: MessageCircle, label: "WhatsApp", external: true },
    { url: s?.tiktok_url, icon: Music2, label: "TikTok" },
    { url: s?.shopee_url, icon: ShoppingBag, label: "Shopee" },
    { url: s?.tokopedia_url, icon: ShoppingBag, label: "Tokopedia" },
    { url: `mailto:${email}`, icon: Mail, label: "Email" },
  ].filter((x) => x.url);
  return (
  <footer className="bg-foreground text-background">
    <div className="container py-16 grid md:grid-cols-4 gap-10">
      <div className="md:col-span-2">
        <a href="#top" className="inline-block bg-background/95 rounded-2xl p-3">
          <img src={logo} alt="Hanrose Atelier" className="h-24 w-auto object-contain" />
        </a>
        <p className="mt-4 text-sm text-background/70 max-w-sm leading-relaxed">
          Quality & comfy for your little ones. Premium kidswear boutique —
          new arrivals & curated preloved gems.
        </p>
        <div className="mt-6 flex gap-3">
          {socials.map((sc) => (
            <a key={sc.label} href={sc.url as string} target="_blank" rel="noreferrer" aria-label={sc.label} className="h-10 w-10 rounded-full bg-background/10 hover:bg-pink hover:text-foreground flex items-center justify-center transition-smooth">
              <sc.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-serif text-lg mb-4">Shop</h4>
        <ul className="space-y-2 text-sm text-background/70">
          <li><a href="#new" className="hover:text-pink transition-smooth">New Arrivals</a></li>
          <li><a href="#collections" className="hover:text-pink transition-smooth">Collections</a></li>
          <li><a href="#collections" className="hover:text-pink transition-smooth">Preloved Gems</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-serif text-lg mb-4">Hanrose</h4>
        <ul className="space-y-2 text-sm text-background/70">
          <li><a href="#about" className="hover:text-pink transition-smooth">About</a></li>
          <li><a href="/blog" className="hover:text-pink transition-smooth">Blog</a></li>
          <li><a href="#reviews" className="hover:text-pink transition-smooth">Reviews</a></li>
          <li><a href="#faq" className="hover:text-pink transition-smooth">FAQ</a></li>
        </ul>
        <Button asChild variant="hanrose" size="sm" className="mt-5">
          <a href={wa} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </Button>
      </div>
    </div>
    <div className="border-t border-background/10">
      <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-background/50">
        <p>© {new Date().getFullYear()} Hanrose Atelier. All rights reserved.</p>
        <p className="flex items-center gap-1">Made with <Heart className="h-3 w-3 text-pink" /> for little moments</p>
      </div>
    </div>
  </footer>
);
};
