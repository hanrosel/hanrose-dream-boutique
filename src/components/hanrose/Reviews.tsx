import { Check, CheckCheck } from "lucide-react";

const reviews = [
  { name: "Mama R.", time: "10:24", text: "Bahannya lembut bangettt 😍 anak suka banget pake dressnya, ga gerah!", read: true },
  { name: "Mama D.", time: "14:02", text: "Packagingnya cantik & rapi, kayak buka kado. Worth every rupiah ✨", read: true },
  { name: "Mama A.", time: "09:11", text: "Preloved yang aku beli kondisinya beneran kayak baru. Recommended!", read: true },
  { name: "Mama S.", time: "21:48", text: "Anak aku pake buat birthday photoshoot, hasilnya cakep banget 🎀", read: true },
  { name: "Mama K.", time: "16:33", text: "Ownernya helpful, fast respond, sizing rekomendasi pas banget.", read: true },
  { name: "Mama Y.", time: "11:07", text: "Detailnya premium, jahitannya rapi. Bakal repeat order pasti! 🤍", read: true },
];

export const Reviews = () => (
  <section id="reviews" className="bg-gradient-soft py-20 md:py-28">
    <div className="container">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs uppercase tracking-[0.3em] text-pink">Loved by Mamas</span>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">
          Real words from <em className="text-pink not-italic">happy mamas</em>.
        </h2>
      </div>
      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="relative bg-white rounded-3xl rounded-tl-md p-5 shadow-card animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-pink">{r.name}</span>
              <span className="text-[0.65rem] text-muted-foreground">{r.time}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{r.text}</p>
            <div className="mt-2 flex justify-end">
              {r.read ? (
                <CheckCheck className="h-3.5 w-3.5 text-blue" />
              ) : (
                <Check className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
