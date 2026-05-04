import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/hanrose/Navbar";
import { Footer } from "@/components/hanrose/Footer";
import { FloatingWA } from "@/components/hanrose/FloatingWA";
import { Card } from "@/components/ui/card";
import { defaultBlogPosts, type BlogPost } from "@/lib/blog";
import { setSeo } from "@/lib/seo";

const formatDate = (date: string | null) => {
  if (!date) return "Hanrose Journal";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

export default function BlogPage() {
  useEffect(() => {
    setSeo({
      title: "Blog Kidswear & Outfit Anak | Hanrose Atelier",
      description:
        "Inspirasi memilih baju anak premium yang nyaman, aesthetic, dan cocok untuk daily wear, birthday, photoshoot, sampai special occasion.",
      image: "/blog/premium-kidswear-little-moments.png",
      path: "/blog",
      type: "website",
    });
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,title,slug,excerpt,cover_image,published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data?.length ? data : defaultBlogPosts) as BlogPost[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="bg-gradient-soft pt-32 pb-14 md:pt-40 md:pb-20">
          <div className="container">
            <span className="text-xs uppercase tracking-[0.3em] text-pink">
              Hanrose Journal
            </span>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
              Catatan kecil untuk momen besar si kecil.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Inspirasi memilih outfit anak yang nyaman, manis, dan siap menemani
              daily wear sampai special occasion.
            </p>
          </div>
        </section>

        <section className="container py-14 md:py-20">
          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : posts.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden rounded-3xl border-0 bg-white shadow-card transition-smooth hover:shadow-elegant">
                  <Link to={`/blog/${post.slug}`} className="group block">
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-pink-blue" />
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 text-pink" />
                        {formatDate(post.published_at)}
                      </div>
                      <h2 className="mt-3 font-serif text-2xl leading-tight text-foreground">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {post.excerpt}
                        </p>
                      )}
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-pink">
                        Read more <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-muted p-10 text-center text-sm text-muted-foreground">
              Blog post belum tersedia.
            </div>
          )}
        </section>
      </main>
      <Footer />
      <FloatingWA />
    </div>
  );
}
