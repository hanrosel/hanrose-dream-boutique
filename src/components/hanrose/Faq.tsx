import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Bagaimana cara cek size yang pas?", a: "Setiap produk memiliki size chart. Kamu juga bisa kirim umur, tinggi, dan berat anak via WhatsApp untuk rekomendasi size yang paling pas." },
  { q: "Bagaimana pengiriman & estimasi sampai?", a: "Kami kirim dari Indonesia menggunakan ekspedisi pilihan kamu (JNE, J&T, SiCepat, dll). Estimasi 1–4 hari kerja tergantung lokasi." },
  { q: "Metode pembayaran apa saja?", a: "Transfer bank (BCA, Mandiri, BRI) dan QRIS. Detail pembayaran akan diberikan saat konfirmasi order via WhatsApp." },
  { q: "Apakah bisa retur atau tukar?", a: "Semua item bisa ditukar dalam 2x24 jam jika ada defect dari kami, sesuai deskripsi yang dijelaskan sebelum order." },
];

export const Faq = () => (
  <section id="faq" className="bg-cream py-20 md:py-28">
    <div className="container max-w-3xl">
      <div className="text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-pink">FAQ</span>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">
          Frequently <em className="text-blue not-italic">Asked</em>
        </h2>
      </div>
      <Accordion type="single" collapsible className="mt-10 space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="bg-white rounded-2xl border-0 shadow-card px-5"
          >
            <AccordionTrigger className="font-serif text-lg text-left hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
