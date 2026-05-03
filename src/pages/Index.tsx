import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/hanrose/Navbar";
import { Hero } from "@/components/hanrose/Hero";
import { TrustStrip } from "@/components/hanrose/TrustStrip";
import { Collections } from "@/components/hanrose/Collections";
import { Story } from "@/components/hanrose/Story";
import { Products } from "@/components/hanrose/Products";
import { Lookbook } from "@/components/hanrose/Lookbook";
import { Reviews } from "@/components/hanrose/Reviews";
import { HowToOrder } from "@/components/hanrose/HowToOrder";
import { Newsletter } from "@/components/hanrose/Newsletter";
import { Faq } from "@/components/hanrose/Faq";
import { Footer } from "@/components/hanrose/Footer";
import { FloatingWA } from "@/components/hanrose/FloatingWA";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index = () => {
  const { data: s } = useSiteSettings();
  const location = useLocation();

  // Scroll to hash section after navigating from another page (e.g. /#new)
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [location.hash]);
  useEffect(() => {
    if (!s) return;
    if (s.meta_title) document.title = s.meta_title;
    const setMeta = (name: string, val: string | null | undefined, isProperty = false) => {
      if (!val) return;
      const sel = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector<HTMLMetaElement>(sel);
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) el.setAttribute("property", name); else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.content = val;
    };
    setMeta("description", s.meta_description);
    setMeta("keywords", s.meta_keywords);
    setMeta("og:title", s.meta_title, true);
    setMeta("og:description", s.meta_description, true);
    setMeta("og:image", s.og_image, true);
  }, [s]);
  return (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <Hero />
      <TrustStrip />
      <Collections />
      <Story />
      <Products />
      <Lookbook />
      <Reviews />
      <HowToOrder />
      <Newsletter />
      <Faq />
    </main>
    <Footer />
    <FloatingWA />
  </div>
);
};

export default Index;
