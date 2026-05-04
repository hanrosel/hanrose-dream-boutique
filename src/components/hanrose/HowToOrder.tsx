import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  { n: "01", t: "Belanja Koleksi", d: "Buka halaman koleksi, pilih item, lalu add to cart." },
  { n: "02", t: "Checkout", d: "Isi nama, WhatsApp, alamat, dan catatan size tanpa login." },
  { n: "03", t: "Konfirmasi Admin", d: "Kami cek stok, ukuran, ongkir, dan total lewat WhatsApp." },
  { n: "04", t: "Transfer", d: "Transfer setelah stok dan total dikonfirmasi admin." },
  { n: "05", t: "Packing & Kirim", d: "Dipacking cantik & dikirim hari berikutnya." },
];

export const HowToOrder = () => (
  <section className="container py-20 md:py-28">
    <div className="text-center max-w-xl mx-auto">
      <span className="text-xs uppercase tracking-[0.3em] text-pink">How To Order</span>
      <h2 className="mt-3 font-serif text-4xl md:text-5xl">
        Cara <em className="text-blue not-italic">Order</em>
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Simple, personal, dan dilayani langsung oleh owner.
      </p>
    </div>
    <ol className="mt-12 grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-5">
      {steps.map((s, i) => (
        <li
          key={s.n}
          className="relative bg-white rounded-3xl p-6 shadow-card animate-fade-up"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <div className="font-serif text-3xl text-pink">{s.n}</div>
          <h3 className="mt-2 font-serif text-xl">{s.t}</h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{s.d}</p>
        </li>
      ))}
    </ol>
    <div className="mt-10 text-center">
      <Button asChild variant="hanrose" size="lg">
        <Link to="/collections">
          <ShoppingBag className="h-4 w-4" /> Mulai Belanja
        </Link>
      </Button>
    </div>
  </section>
);
