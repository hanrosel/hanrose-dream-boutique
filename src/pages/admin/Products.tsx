import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Download, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

type P = {
  id: string; name: string; slug: string; description: string | null;
  price: number | null; stock: number; badge: string | null; status: string;
  category_id: string | null; images: string[]; featured: boolean; sort_order: number;
};
type Cat = { id: string; name: string };

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const empty = {
  name: "", slug: "", description: "", price: 0, stock: 0,
  badge: "New", status: "new", category_id: null as string | null,
  images: [] as string[], featured: true, sort_order: 0,
};
const PAGE_SIZE = 20;

export default function AdminProducts() {
  const qc = useQueryClient();
  const importRef = useRef<HTMLInputElement>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["admin_products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data as P[];
    },
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["admin_cats_select"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name").order("sort_order");
      return (data ?? []) as Cat[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<P | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Filtering
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchCat = catFilter === "all" || p.category_id === catFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const start = (p?: P) => {
    if (p) {
      setEditing(p);
      setForm({
        name: p.name, slug: p.slug, description: p.description ?? "",
        price: p.price ?? 0, stock: p.stock, badge: p.badge ?? "",
        status: p.status, category_id: p.category_id, images: p.images ?? [],
        featured: p.featured, sort_order: p.sort_order,
      });
    } else {
      setEditing(null);
      setForm(empty);
    }
    setOpen(true);
  };

  const save = async () => {
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin_products"] });
  };

  const del = async (id: string) => {
    if (!confirm("Hapus produk?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin_products"] });
  };

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "products.json"; a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCSV = () => {
    const cols = ["id","name","slug","description","price","stock","badge","status","category_id","featured","sort_order","images"];
    const rows = products.map((p) =>
      cols.map((c) => {
        const v = (p as Record<string, unknown>)[c];
        const str = Array.isArray(v) ? v.join("|") : String(v ?? "");
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [cols.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "products.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        const rows = (Array.isArray(json) ? json : [json]).map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ id: _id, created_at: _c, updated_at: _u, ...rest }: Record<string, unknown>) => rest
        ) as P[];
        const { error } = await supabase.from("products").upsert(rows, { onConflict: "slug" });
        if (error) return toast.error(error.message);
        toast.success(`${rows.length} produk diimport`);
        qc.invalidateQueries({ queryKey: ["admin_products"] });
      } catch {
        toast.error("File tidak valid");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">Products</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={exportJSON}><Download className="h-4 w-4 mr-1" />JSON</Button>
          <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" />Import JSON
          </Button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Button variant="hanrose" size="sm" onClick={() => start()}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Cari nama / slug..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className="w-56"
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); resetPage(); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="limited">Limited</SelectItem>
            <SelectItem value="preloved">Preloved</SelectItem>
            <SelectItem value="sold">Sold out</SelectItem>
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v); resetPage(); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground self-center">{filtered.length} produk</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">Tidak ada produk</TableCell></TableRow>
            )}
            {paginated.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    : <div className="h-10 w-10 rounded-lg bg-muted" />}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.slug}</div>
                </TableCell>
                <TableCell className="text-sm">{cats.find((c) => c.id === p.category_id)?.name ?? "—"}</TableCell>
                <TableCell className="text-sm">Rp {p.price?.toLocaleString("id-ID") ?? "—"}</TableCell>
                <TableCell className="text-sm">{p.stock}</TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">{p.status}</span>
                </TableCell>
                <TableCell className="text-sm">{p.featured ? "✓" : "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => start(p)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" onClick={() => del(p.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-muted-foreground">
          Halaman {page} dari {totalPages}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Product</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Photos</Label>
              <ImageUpload value={form.images} onChange={(v) => setForm({ ...form, images: v })} folder="products" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Price (Rp)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
              <div><Label>Sort</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Badge</Label>
                <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="New / Limited" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="preloved">Preloved</SelectItem>
                    <SelectItem value="sold">Sold out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id ?? "none"} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              <Label>Featured (tampil di New Arrivals)</Label>
            </div>
            <Button variant="hanrose" onClick={save} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
