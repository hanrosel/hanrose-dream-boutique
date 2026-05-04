type BlogPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
};

const SOCIAL_BOT_PATTERN =
  /(whatsapp|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|pinterest|embedly|quora link preview|skypeuripreview|vkshare)/i;

const DEFAULT_TITLE = "Hanrose Atelier - Premium Kidswear Boutique";
const DEFAULT_DESCRIPTION =
  "Baju anak premium, comfy, dan aesthetic untuk daily wear, photoshoot, birthday, dan special occasion.";
const DEFAULT_IMAGE = "/blog/premium-kidswear-little-moments.png?v=2";
const FALLBACK_SUPABASE_URL = "https://pddocaajqgpprnfoyszf.supabase.co";
const FALLBACK_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZG9jYWFqcWdwcHJuZm95c3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTM0ODIsImV4cCI6MjA5MzM4OTQ4Mn0.qfMKbQyei992Gz_u3cSqD2-GTAnEnCTNvIhrJlWwEEc";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const absoluteUrl = (requestUrl: URL, value?: string | null) => {
  const path = value || DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(path)) return path;
  return `${requestUrl.origin}${path.startsWith("/") ? path : `/${path}`}`;
};

const fetchPost = async (slug: string): Promise<BlogPost | null> => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const endpoint = new URL("/rest/v1/blog_posts", supabaseUrl);
  endpoint.searchParams.set(
    "select",
    "title,slug,excerpt,cover_image,meta_title,meta_description,published_at",
  );
  endpoint.searchParams.set("slug", `eq.${slug}`);
  endpoint.searchParams.set("published", "eq.true");
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) return null;
  const rows = (await response.json()) as BlogPost[];
  return rows[0] ?? null;
};

const renderPreviewHtml = (requestUrl: URL, post: BlogPost | null) => {
  const title = post?.meta_title || (post ? `${post.title} | Hanrose Atelier` : DEFAULT_TITLE);
  const description = post?.meta_description || post?.excerpt || DEFAULT_DESCRIPTION;
  const image = absoluteUrl(requestUrl, post?.cover_image || DEFAULT_IMAGE);
  const canonical = `${requestUrl.origin}${requestUrl.pathname}`;

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:site_name" content="Hanrose Atelier" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    ${post?.published_at ? `<meta property="article:published_time" content="${escapeHtml(post.published_at)}" />` : ""}
  </head>
  <body>
    <main>
      <h1>${escapeHtml(post?.title || title)}</h1>
      <p>${escapeHtml(description)}</p>
      <a href="${escapeHtml(canonical)}">${escapeHtml(canonical)}</a>
    </main>
  </body>
</html>`;
};

export const config = {
  matcher: ["/", "/blog/:path*"],
};

export default async function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") || "";
  if (!SOCIAL_BOT_PATTERN.test(userAgent)) return;

  const requestUrl = new URL(request.url);
  const slug = requestUrl.pathname.split("/").filter(Boolean)[1];
  const post = slug ? await fetchPost(slug) : null;

  return new Response(renderPreviewHtml(requestUrl, post), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=300",
    },
  });
}
