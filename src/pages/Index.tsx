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

const Index = () => (
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

export default Index;
