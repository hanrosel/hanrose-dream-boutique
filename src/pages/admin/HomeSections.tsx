import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  section: string;
  label: string;
  image_url: string | null;
  images: string[];
  link_url: string | null;
  sort_order: number;
};

// Local editable state per row
type LocalRow = Omit<Row, "images"> & { allImages: string[] };

const SECTION_LABELS: Record<string, string> = {
  hero:       "Hero Section",
  collection: "Featured Collections",
  about:      "About / Brand Story",
  lookbook:   "Lookbook",
};
const SECTION_ORDER = ["hero", "collection", "about", "lookbook"];

const toLocal = (r: Row): LocalRow => {
  const all: string[] = [];
  if (r.image_url) all.push(r.image_url);
  r.images?.forEach((img) => { if (img && !all.includes(img)) all.push(img); });
  return { ...r, allImages: all };
};

export default function AdminHomeSections() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState<string | null>(null);
  const [local, setLocal] = useState<Record<string, LocalRow>>({});

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin_home_sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_sections")
        .select("*")
        .order("section")
        .order("sort_order");
      if (error) throw error;
      return data as unknown as Row[];
    },
  });

  useEffect(() => {
    if (!rows.length) return;
    const map: Record<string, LocalRow> = {};
    rows.forEach((r) => { map[r.id] = toLocal(r); });
    setLocal(map);
  }, [rows]);

  const get = (id: string): LocalRow =>
    local[id] ?? toLocal(rows.find((r) => r.id === id)!);

  const patch = <K extends keyof LocalRow>(id: string, key: K, val: LocalRow[K]) =>
    setLocal((prev) => ({ ...prev, [id]: { ...get(id), [key]: val } }));

  const save = async (id: string) => {
    const r = get(id);
    setSaving(id);
    const { error } = await supabase
      .from("home_sections")
      .update({
        label:     r.label,
        image_url: r.allImages[0] ?? null,
        images:    r.allImages.slice(1),
        link_url:  r.link_url,
      })
      .eq("id", id);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    qc.invalidateQueries({ queryKey: ["admin_home_sections"] });
    qc.invalidateQueries({ queryKey: ["home_sections"] });
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const grouped = SECTION_ORDER.reduce<Record<string, Row[]>>((acc, sec) => {
    acc[sec] = rows.filter((r) => r.section === sec);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl space-y-10">
      <h1 className="font-serif text-3xl">Home Sections</h1>
      <p className="text-sm text-muted-foreground -mt-6">
        Upload foto (bisa banyak — otomatis jadi slide) dan set URL tujuan saat foto diklik.
      </p>

      {SECTION_ORDER.map((sec) => (
        <div key={sec}>
          <h2 className="font-serif text-xl mb-4">{SECTION_LABELS[sec]}</h2>
          <div className="space-y-4">
            {grouped[sec]?.map((row) => {
              const r = get(row.id);
              if (!r) return null;
              const isSaving = saving === row.id;
              return (
                <Card key={row.id} className="p-5 rounded-2xl space-y-4">
                  <div className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    {r.label}
                  </div>

                  <div>
                    <Label>Caption / Label</Label>
                    <Input
                      value={r.label}
                      onChange={(e) => patch(row.id, "label", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>
                      Foto{" "}
                      <span className="text-muted-foreground font-normal normal-case tracking-normal">
                        — upload banyak, otomatis jadi slide
                      </span>
                    </Label>
                    <ImageUpload
                      value={r.allImages}
                      onChange={(v) => patch(row.id, "allImages", v)}
                      multiple={true}
                      folder="home"
                    />
                  </div>

                  <div>
                    <Label>URL tujuan (saat foto diklik)</Label>
                    <Input
                      value={r.link_url ?? ""}
                      onChange={(e) => patch(row.id, "link_url", e.target.value || null)}
                      placeholder="https://... atau #new"
                    />
                  </div>

                  <Button
                    variant="hanrose"
                    size="sm"
                    onClick={() => save(row.id)}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      : <Save className="h-4 w-4 mr-1" />}
                    Simpan
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
