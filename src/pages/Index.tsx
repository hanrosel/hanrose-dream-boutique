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
import { setSeo } from "@/lib/seo";

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
    setSeo({
      title: s.meta_title,
      description: s.meta_description,
      image: s.og_image,
      path: "/",
      type: "website",
    });
    if (s.meta_keywords) {
      let el = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", "keywords");
        document.head.appendChild(el);
      }
      el.content = s.meta_keywords;
    }
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
