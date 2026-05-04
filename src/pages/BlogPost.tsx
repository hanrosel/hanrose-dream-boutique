import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/hanrose/Navbar";
import { Footer } from "@/components/hanrose/Footer";
import { FloatingWA } from "@/components/hanrose/FloatingWA";
import { Button } from "@/components/ui/button";
import { useSiteSettings, buildWaLink } from "@/hooks/useSiteSettings";
import { defaultBlogPost, type BlogPost } from "@/lib/blog";

const formatDate = (date: string | null) => {
  if (!date) return "Hanrose Journal";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const renderMarkdown = (content: string) =>
  content.split("\n").map((line, index) => {
    if (!line.trim()) return null;
    if (line.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-10 font-serif text-3xl leading-tight">
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={index} className="ml-5 list-disc text-muted-foreground">
          {line.replace("- ", "")}
        </li>
      );
    }
    return (
      <p key={index} className="mt-5 leading-8 text-muted-foreground">
        {line}
      </p>
    );
  });

export default function BlogPostPage() {
  const { slug } = useParams();
  const { data: settings } = useSiteSettings();
  const wa = buildWaLink(settings);

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog_post", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("title,slug,excerpt,content,cover_image,meta_title,meta_description,published_at")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      if (error) {
        if (slug === defaultBlogPost.slug) return defaultBlogPost;
        throw error;
      }
      return (data ?? defaultBlogPost) as BlogPost;
    },
  });

  useEffect(() => {
    if (!post) return;
    if (post.meta_title) document.title = post.meta_title;
    if (post.meta_description) {
      let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", "description");
        document.head.appendChild(el);
      }
      el.content = post.meta_description;
    }
  }, [post]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 md:pt-32">
        {isLoading ? (
          <div className="container py-20">
            <div className="h-[520px] animate-pulse rounded-3xl bg-muted" />
          </div>
        ) : post ? (
          <>
            <article>
              <header className="container pb-10">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-smooth hover:text-pink"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to journal
                </Link>
                <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 text-pink" />
                      {formatDate(post.published_at)}
                    </div>
                    <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
                      {post.title}
                    </h1>
                    {post.excerpt && (
                      <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="aspect-[16/10] w-full rounded-3xl object-cover shadow-elegant"
                    />
                  )}
                </div>
              </header>

              <div className="border-y bg-gradient-soft">
                <div className="container max-w-3xl py-12 md:py-16">
                  <div className="text-base md:text-lg">
                    {post.content ? renderMarkdown(post.content) : null}
                  </div>
                  <div className="mt-12 rounded-3xl bg-white p-6 shadow-soft">
                    <h2 className="font-serif text-2xl">Butuh rekomendasi size atau style?</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Tim Hanrose bisa bantu pilih outfit yang nyaman untuk umur,
                      aktivitas, dan momen si kecil.
                    </p>
                    <Button asChild variant="whatsapp" className="mt-5">
                      <a href={wa} target="_blank" rel="noreferrer">
                        <MessageCircle className="h-4 w-4" /> Chat via WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          </>
        ) : (
          <div className="container py-20 text-center">
            <h1 className="font-serif text-4xl">Post tidak ditemukan.</h1>
            <Button asChild variant="hanrose" className="mt-6">
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
      <FloatingWA />
    </div>
  );
}
