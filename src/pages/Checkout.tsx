import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MessageCircle, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/hanrose/Navbar";
import { Footer } from "@/components/hanrose/Footer";
import { FloatingWA } from "@/components/hanrose/FloatingWA";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { useSiteSettings, buildWaLink } from "@/hooks/useSiteSettings";
import { setSeo } from "@/lib/seo";
import { toast } from "sonner";

type CheckoutForm = {
  customer_name: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  notes: string;
};

const initialForm: CheckoutForm = {
  customer_name: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  notes: "",
};

const formatPrice = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

const generateOrderCode = () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HR-${y}${m}${d}-${random}`;
};

export default function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ orderCode: string; total: number; waLink: string } | null>(null);

  useEffect(() => {
    setSeo({
      title: "Checkout | Hanrose Atelier",
      description: "Checkout tanpa login untuk order kidswear Hanrose Atelier via WhatsApp dan transfer bank.",
      path: "/checkout",
      type: "website",
    });
  }, []);

  const total = cart.subtotal;
  const summary = useMemo(
    () =>
      cart.items
        .map((item) => {
          const size = item.selectedSize ? ` (${item.selectedSize})` : "";
          return `- ${item.name}${size} x${item.quantity} - ${formatPrice((item.price ?? 0) * item.quantity)}`;
        })
        .join("\n"),
    [cart.items],
  );

  const set = (key: keyof CheckoutForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!cart.items.length) return toast.error("Cart masih kosong.");
    const missingSize = cart.items.find((item) => item.sizes?.length && !item.selectedSize);
    if (missingSize) return toast.error(`Pilih size untuk ${missingSize.name}.`);
    if (!form.customer_name.trim() || !form.whatsapp.trim() || !form.address.trim() || !form.city.trim()) {
      return toast.error("Nama, WhatsApp, alamat, dan kota wajib diisi.");
    }

    setBusy(true);
    const ids = cart.items.map((item) => item.id);
    const { data: latestProducts, error: productError } = await supabase
      .from("products")
      .select("id,name,stock,status,sizes")
      .in("id", ids);

    if (productError) {
      setBusy(false);
      return toast.error(productError.message);
    }

    for (const item of cart.items) {
      const latest = latestProducts?.find((product) => product.id === item.id);
      if (!latest || latest.status === "sold" || latest.stock < item.quantity) {
        setBusy(false);
        return toast.error(`${item.name} sudah sold out atau stok tidak cukup.`);
      }
      if (latest.sizes?.length && !latest.sizes.includes(item.selectedSize)) {
        setBusy(false);
        return toast.error(`Size ${item.selectedSize || "-"} untuk ${item.name} tidak tersedia.`);
      }
    }

    const orderId = crypto.randomUUID();
    const orderCode = generateOrderCode();

    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      order_code: orderCode,
      customer_name: form.customer_name.trim(),
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim() || null,
      address: form.address.trim(),
      city: form.city.trim(),
      notes: form.notes.trim() || null,
      subtotal: cart.subtotal,
      shipping_fee: 0,
      total,
      status: "pending_payment",
      payment_method: "bank_transfer",
    } as never);

    if (orderError) {
      setBusy(false);
      return toast.error(orderError.message);
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      cart.items.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image || null,
        price: item.price ?? 0,
        quantity: item.quantity,
        selected_size: item.selectedSize || null,
        notes: item.notes || null,
      })) as never,
    );

    setBusy(false);
    if (itemsError) {
      await supabase.from("orders").delete().eq("id", orderId);
      return toast.error(itemsError.message);
    }

    const message = [
      `Halo Hanrose Atelier, saya mau konfirmasi order ${orderCode}.`,
      "",
      summary,
      "",
      `Nama: ${form.customer_name}`,
      `WhatsApp: ${form.whatsapp}`,
      `Alamat: ${form.address}, ${form.city}`,
      `Total sementara: ${formatPrice(total)}`,
      "",
      "Mohon info rekening transfer dan konfirmasi stok/ongkir ya.",
    ].join("\n");
    const waLink = buildWaLink(settings, undefined).replace(
      /text=.*/,
      `text=${encodeURIComponent(message)}`,
    );

    cart.clearCart();
    setDone({ orderCode, total, waLink });
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container flex min-h-[70vh] items-center justify-center pt-32 pb-20">
          <Card className="max-w-xl rounded-3xl border-0 bg-white p-8 text-center shadow-elegant">
            <CheckCircle2 className="mx-auto h-12 w-12 text-pink" />
            <h1 className="mt-5 font-serif text-4xl">Order diterima.</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Kode order kamu <span className="font-medium text-foreground">{done.orderCode}</span>.
              Admin akan konfirmasi stok, ongkir, dan rekening transfer sebelum order diproses.
            </p>
            <div className="mt-6 rounded-2xl bg-pink-soft p-4">
              <div className="text-xs uppercase tracking-wider text-pink">Total sementara</div>
              <div className="mt-1 font-serif text-3xl">{formatPrice(done.total)}</div>
            </div>
            <Button asChild variant="whatsapp" size="lg" className="mt-6 w-full">
              <a href={done.waLink} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> Konfirmasi via WhatsApp
              </a>
            </Button>
            <Button asChild variant="hanroseOutline" className="mt-3 w-full">
              <Link to="/collections">Lanjut lihat koleksi</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-32 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-pink"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <section>
            <span className="text-xs uppercase tracking-[0.3em] text-pink">Guest checkout</span>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl">Checkout tanpa login.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Isi data pengiriman dulu. Admin Hanrose akan cek stok, ongkir, dan rekening transfer via WhatsApp.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nama lengkap</Label>
                  <Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} required />
                </div>
                <div>
                  <Label>Nomor WhatsApp</Label>
                  <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="08..." required />
                </div>
              </div>
              <div>
                <Label>Email (opsional)</Label>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div>
                <Label>Alamat lengkap</Label>
                <Textarea rows={4} value={form.address} onChange={(e) => set("address", e.target.value)} required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Kota / Kecamatan</Label>
                  <Input value={form.city} onChange={(e) => set("city", e.target.value)} required />
                </div>
                <div>
                  <Label>Catatan order</Label>
                  <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Request size, warna, jadwal kirim..." />
                </div>
              </div>

              <Button variant="hanrose" size="lg" className="w-full md:w-auto" disabled={busy || !cart.items.length}>
                {busy ? "Submitting..." : "Submit order"}
              </Button>
            </form>
          </section>

          <aside className="h-fit rounded-3xl bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-pink" />
              <h2 className="font-serif text-2xl">Order summary</h2>
            </div>
            {cart.items.length ? (
              <div className="mt-5 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.image && <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />}
                    <div className="flex-1">
                      <div className="font-serif text-lg leading-tight">{item.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        x{item.quantity}{item.selectedSize ? ` - Size ${item.selectedSize}` : ""}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{formatPrice((item.price ?? 0) * item.quantity)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">Cart masih kosong.</p>
            )}
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ongkir</span>
                <span>Dikonfirmasi admin</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium">Total sementara</span>
                <span className="font-serif text-3xl">{formatPrice(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      <FloatingWA />
    </div>
  );
}
