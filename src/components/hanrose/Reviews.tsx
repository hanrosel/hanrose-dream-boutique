import { CheckCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SimpleSlider } from "./SimpleSlider";

type R = { id: string; name: string; text: string; screenshot: string[] };

export const Reviews = () => {
  const { data: reviews = [] } = useQuery({
    queryKey: ["home_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id,name,text,screenshot")
        .eq("approved", true)
        .order("sort_order")
        .limit(9);
      if (error) throw error;
      return data as R[];
    },
  });

  return (
    <section id="reviews" className="bg-gradient-soft py-20 md:py-28">
      <div className="container">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-pink">Loved by Mamas</span>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            Real words from <em className="text-pink not-italic">happy mamas</em>.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {reviews.map((r, i) => (
            <div
              key={r.id}
              className="relative bg-white rounded-3xl rounded-tl-md overflow-hidden shadow-card animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Screenshot slide (if any) */}
              {r.screenshot?.length > 0 && (
                <SimpleSlider
                  images={r.screenshot}
                  className="aspect-[4/3] w-full"
                  dots={r.screenshot.length > 1}
                />
              )}

              {/* Text review */}
              {r.text && (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-pink">{r.name}</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{r.text}</p>
                  <div className="mt-2 flex justify-end">
                    <CheckCheck className="h-3.5 w-3.5 text-blue" />
                  </div>
                </div>
              )}

              {/* Screenshot-only: show name below */}
              {!r.text && r.screenshot?.length > 0 && (
                <div className="px-4 pb-3 pt-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-pink">{r.name}</span>
                  <CheckCheck className="h-3.5 w-3.5 text-blue" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
