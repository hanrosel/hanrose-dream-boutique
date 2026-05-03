import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";

export default function AdminSettings() {
  const { data, isLoading } = useSiteSettings();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);

  useEffect(() => { if (data) setForm(data); }, [data]);

  if (isLoading || !form) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  const save = async () => {
    const { error } = await supabase.from("site_settings").update(form).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl mb-6">Site Settings</h1>

      <Card className="p-6 rounded-2xl space-y-4 mb-6">
        <h2 className="font-serif text-xl">Contact & Sosmed</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>WhatsApp number</Label><Input value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder="6287887297885" /></div>
          <div><Label>Default WA message</Label><Input value={form.whatsapp_message} onChange={(e) => set("whatsapp_message", e.target.value)} /></div>
          <div><Label>Email</Label><Input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></div>
          <div><Label>Instagram URL</Label><Input value={form.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} /></div>
          <div><Label>TikTok URL</Label><Input value={form.tiktok_url ?? ""} onChange={(e) => set("tiktok_url", e.target.value)} /></div>
          <div><Label>Shopee URL</Label><Input value={form.shopee_url ?? ""} onChange={(e) => set("shopee_url", e.target.value)} /></div>
          <div><Label>Tokopedia URL</Label><Input value={form.tokopedia_url ?? ""} onChange={(e) => set("tokopedia_url", e.target.value)} /></div>
        </div>
      </Card>

      <Card className="p-6 rounded-2xl space-y-4 mb-6">
        <h2 className="font-serif text-xl">SEO (Yoast-style)</h2>
        <div><Label>Meta title</Label><Input value={form.meta_title ?? ""} onChange={(e) => set("meta_title", e.target.value)} /></div>
        <div><Label>Meta description</Label><Textarea value={form.meta_description ?? ""} onChange={(e) => set("meta_description", e.target.value)} /></div>
        <div><Label>Meta keywords</Label><Input value={form.meta_keywords ?? ""} onChange={(e) => set("meta_keywords", e.target.value)} /></div>
        <div>
          <Label>OG Image</Label>
          <ImageUpload value={form.og_image ? [form.og_image] : []} onChange={(v) => set("og_image", v[0] ?? "")} multiple={false} folder="seo" />
        </div>
      </Card>

      <Card className="p-6 rounded-2xl space-y-4 mb-6">
        <h2 className="font-serif text-xl">Homepage Copy</h2>
        <div><Label>Hero tagline</Label><Input value={form.hero_tagline ?? ""} onChange={(e) => set("hero_tagline", e.target.value)} /></div>
        <div><Label>Hero headline</Label><Textarea value={form.hero_headline ?? ""} onChange={(e) => set("hero_headline", e.target.value)} /></div>
        <div><Label>Hero subtext</Label><Textarea value={form.hero_subtext ?? ""} onChange={(e) => set("hero_subtext", e.target.value)} /></div>
        <div><Label>About text</Label><Textarea rows={4} value={form.about_text ?? ""} onChange={(e) => set("about_text", e.target.value)} /></div>
      </Card>

      <Button variant="hanrose" size="lg" onClick={save}>Save settings</Button>
    </div>
  );
}