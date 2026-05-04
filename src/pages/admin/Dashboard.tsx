import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Package, Star, FileText, FolderTree, ClipboardList } from "lucide-react";

const useCount = (table: "products" | "reviews" | "blog_posts" | "categories" | "orders") =>
  useQuery({
    queryKey: ["count", table],
    queryFn: async () => {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

export default function AdminDashboard() {
  const products = useCount("products");
  const reviews = useCount("reviews");
  const posts = useCount("blog_posts");
  const cats = useCount("categories");
  const orders = useCount("orders");

  const cards = [
    { label: "Orders", value: orders.data ?? "—", icon: ClipboardList },
    { label: "Products", value: products.data ?? "—", icon: Package },
    { label: "Categories", value: cats.data ?? "—", icon: FolderTree },
    { label: "Reviews", value: reviews.data ?? "—", icon: Star },
    { label: "Blog Posts", value: posts.data ?? "—", icon: FileText },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">Selamat datang di admin Hanrose Atelier.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-pink" />
            </div>
            <div className="mt-3 font-serif text-3xl">{c.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
