import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  whatsapp_number: string;
  whatsapp_message: string;
  instagram_url: string | null;
  tiktok_url: string | null;
  shopee_url: string | null;
  tokopedia_url: string | null;
  email: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  hero_tagline: string | null;
  hero_headline: string | null;
  hero_subtext: string | null;
  about_text: string | null;
  about_images: string[];
  about_link_url: string | null;
};

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data as SiteSettings;
    },
    staleTime: 60_000,
  });
};

export const buildWaLink = (s: Pick<SiteSettings, "whatsapp_number" | "whatsapp_message"> | undefined, productName?: string) => {
  const num = s?.whatsapp_number || "6287887297885";
  const base = s?.whatsapp_message || "Halo Hanrose Atelier";
  const msg = productName ? `${base}, saya tertarik dengan ${productName}` : base;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
};