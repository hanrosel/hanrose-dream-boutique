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

type R = { id: string; name: string; text: string; rating: number; approved: boolean; sort_order: number };

export default function AdminReviews() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("sort_order");
      if (error) throw error;
      return data as R[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<R | null>(null);
  const [form, setForm] = useState({ name: "", text: "", rating: 5, approved: true, sort_order: 0 });

  const start = (r?: R) => {
    if (r) { setEditing(r); setForm({ name: r.name, text: r.text, rating: r.rating, approved: r.approved, sort_order: r.sort_order }); }
    else { setEditing(null); setForm({ name: "", text: "", rating: 5, approved: true, sort_order: 0 }); }
    setOpen(true);
  };

  const save = async () => {
    const { error } = editing
      ? await supabase.from("reviews").update(form).eq("id", editing.id)
      : await supabase.from("reviews").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin_reviews"] });
  };

  const del = async (id: string) => {
    if (!confirm("Hapus review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin_reviews"] });
  };

  const toggle = async (r: R) => {
    await supabase.from("reviews").update({ approved: !r.approved }).eq("id", r.id);
    qc.invalidateQueries({ queryKey: ["admin_reviews"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">Reviews</h1>
        <Button variant="hanrose" onClick={() => start()}><Plus className="h-4 w-4" /> Add</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((r) => (
          <Card key={r.id} className="p-4 rounded-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-pink">{"★".repeat(r.rating)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={r.approved} onCheckedChange={() => toggle(r)} />
                <Button size="sm" variant="outline" onClick={() => start(r)}><Pencil className="h-3 w-3" /></Button>
                <Button size="sm" variant="outline" onClick={() => del(r.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
            <p className="text-sm text-foreground/80">{r.text}</p>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Review</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Text</Label><Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Rating</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })} /></div>
              <div><Label>Sort</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.approved} onCheckedChange={(v) => setForm({ ...form, approved: v })} /><Label>Approved (tampil di homepage)</Label></div>
            <Button variant="hanrose" onClick={save} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}