import { useEffect, useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useSiteSettings, buildWaLink } from "@/hooks/useSiteSettings";

const links = [
  { href: "#new", label: "New Arrivals" },
  { href: "#collections", label: "Collections" },
  { href: "#about", label: "About" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: settings } = useSiteSettings();
  const wa = buildWaLink(settings);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-soft" : "bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between py-4">
        <Logo />
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm tracking-wide text-foreground/80 hover:text-pink transition-smooth"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden md:block">
          <Button asChild variant="hanrose" size="sm">
            <a href={wa} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
        </div>
        <button
          className="md:hidden p-2 rounded-full hover:bg-pink-soft transition-smooth"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border">
          <ul className="container py-4 flex flex-col gap-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-foreground/80"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Button asChild variant="hanrose" className="w-full">
                <a href={wa} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" /> Chat WhatsApp
                </a>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};
