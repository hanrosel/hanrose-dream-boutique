import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HomeSection = {
  id: string;
  section: string;
  label: string;
  image_url: string | null;
  images: string[];
  link_url: string | null;
  sort_order: number;
};

export const useHomeSections = (section?: string) => {
  return useQuery({
    queryKey: ["home_sections", section ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("home_sections")
        .select("id,section,label,image_url,images,link_url,sort_order")
        .order("sort_order");
      if (section) q = q.eq("section", section);
      const { data, error } = await q;
      if (error) throw error;
      return data as HomeSection[];
    },
    staleTime: 60_000,
  });
};

/** Gabungkan image_url (legacy) + images array jadi satu list */
export const getAllImages = (row: HomeSection): string[] => {
  const all: string[] = [];
  if (row.image_url) all.push(row.image_url);
  row.images?.forEach((img) => { if (img && !all.includes(img)) all.push(img); });
  return all;
};
