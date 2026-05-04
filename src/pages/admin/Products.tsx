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
import { Plus, Pencil, Trash2, Download, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

type P = {
  id: string; name: string; slug: string; description: string | null;
  price: number | null; stock: number; badge: string | null; status: string;
  sizes: string[];
  category_id: string | null; images: string[]; featured: boolean; sort_order: number;
  show_in_hero: boolean; show_in_collection: boolean; show_in_lookbook: boolean;
  link_url: string | null;
};
type Cat = { id: string; name: string };

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const empty = {
  name: "", slug: "", description: "", price: "", stock: "",
  sizes: [] as string[],
  badge: "New", status: "new", category_id: null as string | null,
  images: [] as string[], featured: true, sort_order: "",
  show_in_hero: false, show_in_collection: false, show_in_lookbook: false,
  link_url: "",
};
const PAGE_SIZE = 20;
const toNumberOrNull = (value: string | number | null | undefined) =>
  value === "" || value == null ? null : Number(value);
const toNumberOrZero = (value: string | number | null | undefined) =>
  value === "" || value == null ? 0 : Number(value);

export default function AdminProducts() {
  const qc = useQueryClient();
  const jsonRef = useRef<HTMLInputElement>(null);
  const csvRef  = useRef<HTMLInputElement>(null);

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
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

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
        price: p.price == null ? "" : String(p.price),
        stock: String(p.stock),
        badge: p.badge ?? "",
        sizes: p.sizes ?? [],
        status: p.status, category_id: p.category_id, images: p.images ?? [],
        featured: p.featured,
        sort_order: String(p.sort_order),
        show_in_hero: p.show_in_hero ?? false,
        show_in_collection: p.show_in_collection ?? false,
        show_in_lookbook: p.show_in_lookbook ?? false,
        link_url: p.link_url ?? "",
      });
    } else {
      setEditing(null);
      setForm(empty);
    }
    setOpen(true);
  };

  const save = async () => {
    const stock = toNumberOrZero(form.stock);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      price: toNumberOrNull(form.price),
      stock,
      sort_order: toNumberOrZero(form.sort_order),
      link_url: form.link_url || null,
      status: stock <= 0 ? "sold" : form.status,
    };
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

  // All exportable columns (includes new homepage flags)
  const EXPORT_COLS = [
    "name","slug","description","price","stock","badge","status",
    "sizes","category_id","images","featured","sort_order",
    "show_in_hero","show_in_collection","show_in_lookbook","link_url",
  ] as const;

  // Export JSON — strips id/timestamps so it can be re-imported cleanly
  const exportJSON = () => {
    const out = products.map((p) =>
      Object.fromEntries(EXPORT_COLS.map((c) => [c, (p as Record<string, unknown>)[c] ?? null]))
    );
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "products.json"; a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCSV = () => {
    const rows = products.map((p) =>
      EXPORT_COLS.map((c) => {
        const v = (p as Record<string, unknown>)[c];
        const str = Array.isArray(v) ? v.join("|") : String(v ?? "");
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [[...EXPORT_COLS].join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "products.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Download blank template CSV so user knows the exact columns
  const downloadTemplate = () => {
    const example = [
      "Dress Bunga Pink","dress-bunga-pink","Dress cantik bahan katun lembut",
      "150000","5","New","new","1Y|2Y|3Y","","","true","0",
      "false","true","false","https://wa.me/6287887297885",
    ].join(",");
    const csv = [[...EXPORT_COLS].join(","), example].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "products-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Shared normaliser for both JSON and CSV rows
  const normaliseRow = (rest: Record<string, unknown>) => ({
    ...rest,
    featured:           rest.featured === true || rest.featured === "true",
    show_in_hero:       rest.show_in_hero === true || rest.show_in_hero === "true",
    show_in_collection: rest.show_in_collection === true || rest.show_in_collection === "true",
    show_in_lookbook:   rest.show_in_lookbook === true || rest.show_in_lookbook === "true",
    images: Array.isArray(rest.images)
      ? rest.images
      : typeof rest.images === "string" && rest.images
        ? rest.images.split("|")
        : [],
    sizes: Array.isArray(rest.sizes)
      ? rest.sizes
      : typeof rest.sizes === "string" && rest.sizes
        ? rest.sizes.split("|").map((size) => size.trim()).filter(Boolean)
        : [],
    // UUID fields — empty string must be null
    category_id: rest.category_id || null,
    link_url:    rest.link_url    || null,
    badge:       rest.badge       || null,
    description: rest.description || null,
    price:  rest.price  !== "" && rest.price  != null ? Number(rest.price)  : null,
    stock:  rest.stock  !== "" && rest.stock  != null ? Number(rest.stock)  : 0,
    sort_order: rest.sort_order !== "" && rest.sort_order != null ? Number(rest.sort_order) : 0,
  });

  const upsertRows = async (rows: Record<string, unknown>[]) => {
    const { error } = await supabase
      .from("products")
      .upsert(rows as unknown as P[], { onConflict: "slug" });
    if (error) return toast.error(error.message);
    toast.success(`${rows.length} produk diimport`);
    qc.invalidateQueries({ queryKey: ["admin_products"] });
    setImportOpen(false);
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        const rows = (Array.isArray(json) ? json : [json]).map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ id: _id, created_at: _c, updated_at: _u, ...rest }: Record<string, unknown>) =>
            normaliseRow(rest)
        );
        await upsertRows(rows);
      } catch {
        toast.error("File JSON tidak valid");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Import CSV
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) return toast.error("CSV kosong atau hanya header");

        // Parse header
        const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());

        // Parse rows — handle quoted fields with commas inside
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let cur = "";
          let inQuote = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
              else inQuote = !inQuote;
            } else if (ch === "," && !inQuote) {
              result.push(cur); cur = "";
            } else {
              cur += ch;
            }
          }
          result.push(cur);
          return result;
        };

        const rows = lines.slice(1).map((line) => {
          const vals = parseCSVLine(line);
          const obj: Record<string, unknown> = {};
          headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _id, created_at: _c, updated_at: _u, ...rest } = obj;
          return normaliseRow(rest);
        });

        await upsertRows(rows);
      } catch {
        toast.error("File CSV tidak valid");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div>
      {/* ── HEADER: 1 baris compact ── */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <h1 className="font-serif text-lg mr-1">Products</h1>
        {/* Search */}
        <Input
          placeholder="Cari..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className="h-7 text-xs w-24 min-w-0"
        />
        {/* Status filter */}
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); resetPage(); }}>
          <SelectTrigger className="h-7 text-xs w-20 min-w-0 px-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="limited">Limited</SelectItem>
            <SelectItem value="preloved">Preloved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        {/* Cat filter */}
        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v); resetPage(); }}>
          <SelectTrigger className="h-7 text-xs w-20 min-w-0 px-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Kategori</SelectItem>
            {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-muted-foreground">{filtered.length}</span>
        {/* Spacer */}
        <div className="flex-1" />
        {/* Export */}
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setExportOpen(true)}>
          <Download className="h-3 w-3 mr-1" />Export
        </Button>
        {/* Import */}
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setImportOpen(true)}>
          <Upload className="h-3 w-3 mr-1" />Import
        </Button>
        <input ref={jsonRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
        <input ref={csvRef}  type="file" accept=".csv"  className="hidden" onChange={handleImportCSV} />
        {/* Add */}
        <Button variant="hanrose" size="sm" className="h-7 px-2 text-xs" onClick={() => start()}>
          <Plus className="h-3 w-3 mr-1" />Add
        </Button>
      </div>

      {/* ── TABLE ── */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full" style={{ fontSize: "11px" }}>
          <thead>
            <tr className="border-b bg-muted/40 text-muted-foreground">
              <th className="w-8 p-1"></th>
              <th className="p-1 text-left font-medium">Nama</th>
              <th className="p-1 text-left font-medium hidden sm:table-cell">Kat.</th>
              <th className="p-1 text-left font-medium">Harga</th>
              <th className="p-1 text-left font-medium hidden sm:table-cell">Stok</th>
              <th className="p-1 text-left font-medium hidden md:table-cell">Size</th>
              <th className="p-1 text-left font-medium">Status</th>
              <th className="p-1 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr><td colSpan={8} className="text-center text-muted-foreground py-6 text-xs">Tidak ada produk</td></tr>
            )}
            {paginated.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                {/* Foto */}
                <td className="p-1">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt="" className="h-8 w-8 rounded object-cover" />
                    : <div className="h-8 w-8 rounded bg-muted" />}
                </td>
                {/* Nama */}
                <td className="p-1 max-w-[110px]">
                  <div className="font-medium leading-tight truncate">{p.name}</div>
                  <div className="text-muted-foreground truncate" style={{ fontSize: "10px" }}>{p.slug}</div>
                </td>
                {/* Kategori */}
                <td className="p-1 hidden sm:table-cell text-muted-foreground truncate max-w-[60px]">
                  {cats.find((c) => c.id === p.category_id)?.name ?? "—"}
                </td>
                {/* Harga */}
                <td className="p-1 whitespace-nowrap">
                  {p.price ? `Rp ${p.price.toLocaleString("id-ID")}` : "—"}
                </td>
                {/* Stok */}
                <td className="p-1 hidden sm:table-cell">{p.stock}</td>
                <td className="p-1 hidden md:table-cell text-muted-foreground max-w-[90px] truncate">
                  {p.sizes?.length ? p.sizes.join(", ") : "—"}
                </td>
                {/* Status */}
                <td className="p-1">
                  <span className="px-1 py-0.5 rounded bg-muted capitalize">{p.status}</span>
                </td>
                {/* Actions */}
                <td className="p-1">
                  <div className="flex gap-0.5">
                    <button onClick={() => start(p)} className="p-1 rounded border hover:bg-muted">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => del(p.id)} className="p-1 rounded border hover:bg-red-50 text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">{page}/{totalPages} · {filtered.length} produk</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-6 w-6 p-0" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" className="h-6 w-6 p-0" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-3 w-3" />
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
              <div>
                <Label>Price (Rp)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Sort</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label>Available sizes</Label>
              <Input
                value={form.sizes.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sizes: e.target.value.split(",").map((size) => size.trim()).filter(Boolean),
                  })
                }
                placeholder="Contoh: 1Y, 2Y, 3Y, 4Y"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Pisahkan dengan koma. Customer hanya bisa checkout size yang tersedia di sini.
              </p>
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

            {/* Homepage placement */}
            <div className="rounded-xl border p-4 space-y-3">
              <div className="text-sm font-medium">Tampilkan di Homepage</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch checked={form.show_in_hero} onCheckedChange={(v) => setForm({ ...form, show_in_hero: v })} />
                  <Label className="font-normal">Hero Section (foto utama, jadi slide)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.show_in_collection} onCheckedChange={(v) => setForm({ ...form, show_in_collection: v })} />
                  <Label className="font-normal">Featured Collections (grid 8, lebih jadi slide)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.show_in_lookbook} onCheckedChange={(v) => setForm({ ...form, show_in_lookbook: v })} />
                  <Label className="font-normal">Lookbook (4 grid, tiap slot slide)</Label>
                </div>
              </div>
              <div>
                <Label>URL tujuan saat foto diklik</Label>
                <Input
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://... atau #new (kosongkan = tidak ada link)"
                />
              </div>
            </div>

            <Button variant="hanrose" onClick={save} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Import Produk</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Pilih format file yang ingin diimport.</p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" className="h-16 flex-col gap-1.5"
              onClick={() => { setImportOpen(false); setTimeout(() => jsonRef.current?.click(), 100); }}>
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">JSON</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1.5"
              onClick={() => { setImportOpen(false); setTimeout(() => csvRef.current?.click(), 100); }}>
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">CSV</span>
            </Button>
          </div>
          <div className="border-t pt-3 mt-1">
            <p className="text-xs text-muted-foreground mb-2">Belum punya template? Download dulu:</p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => { downloadTemplate(); }}>
              <Download className="h-3.5 w-3.5 mr-2" />Download Template CSV
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Upsert by <code className="bg-muted px-1 rounded">slug</code> — produk lama diupdate, baru ditambah.
          </p>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>Export Produk</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{products.length} produk akan diexport.</p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" className="h-16 flex-col gap-1.5"
              onClick={() => { exportCSV(); setExportOpen(false); }}>
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">CSV</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1.5"
              onClick={() => { exportJSON(); setExportOpen(false); }}>
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">JSON</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
