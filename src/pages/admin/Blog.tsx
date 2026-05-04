import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Post = {
  id: string; title: string; slug: string; excerpt: string | null; content: string | null;
  cover_image: string | null; published: boolean; meta_title: string | null;
  meta_description: string | null; published_at: string | null;
};
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const empty = { title: "", slug: "", excerpt: "", content: "", cover_image: "", published: false, meta_title: "", meta_description: "" };

export default function AdminBlog() {
  const qc = useQueryClient();
  const { data: posts = [] } = useQuery({
    queryKey: ["admin_blog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(empty);

  const start = (p?: Post) => {
    if (p) {
      setEditing(p);
      setForm({
        title: p.title, slug: p.slug, excerpt: p.excerpt ?? "", content: p.content ?? "",
        cover_image: p.cover_image ?? "", published: p.published,
        meta_title: p.meta_title ?? "", meta_description: p.meta_description ?? "",
      });
    } else {
      setEditing(null); setForm(empty);
    }
    setOpen(true);
  };

  const save = async () => {
    const payload: any = {
      ...form,
      slug: form.slug || slugify(form.title),
      meta_title: form.meta_title || `${form.title} | Hanrose Atelier`,
      meta_description: form.meta_description || form.excerpt || null,
      published_at: form.published ? new Date().toISOString() : null,
    };
    const { error } = editing
      ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin_blog"] });
  };

  const del = async (id: string) => {
    if (!confirm("Hapus post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin_blog"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">Blog</h1>
        <Button variant="hanrose" onClick={() => start()}><Plus className="h-4 w-4" /> New Post</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {posts.map((p) => (
          <Card key={p.id} className="p-4 rounded-2xl flex gap-4">
            {p.cover_image && <img src={p.cover_image} alt="" className="h-20 w-20 rounded-lg object-cover" loading="lazy" />}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full ${p.published ? "bg-pink/20 text-pink" : "bg-muted text-muted-foreground"}`}>
                  {p.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="font-medium mt-1">{p.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{p.excerpt}</div>
            </div>
            <div className="flex flex-col gap-1">
              <Button size="sm" variant="outline" onClick={() => start(p)}><Pencil className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline" onClick={() => del(p.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </Card>
        ))}
        {!posts.length && <div className="p-8 text-sm text-muted-foreground col-span-full text-center">Belum ada post.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Post</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cover image</Label>
              <ImageUpload value={form.cover_image ? [form.cover_image] : []} onChange={(v) => setForm({ ...form, cover_image: v[0] ?? "" })} multiple={false} folder="blog" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" /></div>
            </div>
            <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div><Label>Content (Markdown)</Label><Textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <div className="border-t pt-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">SEO</Label>
              <div className="space-y-3 mt-2">
                <div><Label>Meta title</Label><Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} /></div>
                <div><Label>Meta description</Label><Textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} /></div>
              </div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Published</Label></div>
            <Button variant="hanrose" onClick={save} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
