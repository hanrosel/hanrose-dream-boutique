const SITE_NAME = "Hanrose Atelier";
const DEFAULT_TITLE = "Hanrose Atelier - Premium Kidswear Boutique";
const DEFAULT_DESCRIPTION =
  "Baju anak premium, comfy, dan aesthetic untuk daily wear, photoshoot, birthday, dan special occasion.";
const DEFAULT_IMAGE = "/blog/premium-kidswear-little-moments.png";

type SeoInput = {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string | null;
};

const configuredSiteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "");

export const absoluteUrl = (value?: string | null) => {
  const path = value || "/";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = configuredSiteUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
};

const setTag = (selector: string, attr: "name" | "property", key: string, content?: string | null) => {
  if (!content) return;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
};

const setCanonical = (href: string) => {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
};

export const setSeo = ({ title, description, image, path = "/", type = "website", publishedTime }: SeoInput) => {
  const nextTitle = title || DEFAULT_TITLE;
  const nextDescription = description || DEFAULT_DESCRIPTION;
  const nextImage = absoluteUrl(image || DEFAULT_IMAGE);
  const nextUrl = absoluteUrl(path);

  document.title = nextTitle;

  setTag('meta[name="description"]', "name", "description", nextDescription);
  setTag('meta[name="author"]', "name", "author", SITE_NAME);

  setTag('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
  setTag('meta[property="og:title"]', "property", "og:title", nextTitle);
  setTag('meta[property="og:description"]', "property", "og:description", nextDescription);
  setTag('meta[property="og:type"]', "property", "og:type", type);
  setTag('meta[property="og:image"]', "property", "og:image", nextImage);
  setTag('meta[property="og:url"]', "property", "og:url", nextUrl);
  if (type === "article") {
    setTag('meta[property="article:author"]', "property", "article:author", SITE_NAME);
    setTag('meta[property="article:published_time"]', "property", "article:published_time", publishedTime);
  }

  setTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  setTag('meta[name="twitter:title"]', "name", "twitter:title", nextTitle);
  setTag('meta[name="twitter:description"]', "name", "twitter:description", nextDescription);
  setTag('meta[name="twitter:image"]', "name", "twitter:image", nextImage);

  setCanonical(nextUrl);
};
