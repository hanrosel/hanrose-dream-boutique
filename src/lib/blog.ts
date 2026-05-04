export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
};

export const defaultBlogPost: BlogPost = {
  id: "default-premium-kidswear",
  title: "Cara Memilih Kidswear Premium yang Tetap Nyaman untuk Si Kecil",
  slug: "cara-memilih-kidswear-premium-yang-nyaman",
  excerpt:
    "Panduan singkat untuk mama yang ingin memilih baju anak premium: lembut di kulit, mudah dipakai, dan tetap cantik untuk daily wear maupun special occasion.",
  cover_image: "/blog/premium-kidswear-little-moments.png",
  meta_title: "Cara Memilih Kidswear Premium yang Nyaman | Hanrose Atelier",
  meta_description:
    "Panduan memilih baju anak premium yang lembut, nyaman, dan cantik untuk daily wear, photoshoot, birthday, dan special occasion.",
  published_at: "2026-05-04T00:00:00.000Z",
  content: `Memilih baju anak sering terlihat sederhana, sampai kita ingat bahwa si kecil bergerak hampir sepanjang hari. Outfit yang cantik perlu tetap ringan, lembut, dan membuat mereka bebas bereksplorasi.

Di Hanrose Atelier, kami percaya kidswear premium bukan hanya soal tampilan. Detail bahan, potongan, jahitan, dan kemudahan pemakaian punya peran besar dalam membuat sebuah piece terasa nyaman dipakai berulang kali.

## Mulai dari bahan yang lembut
Bahan adalah hal pertama yang bersentuhan dengan kulit anak. Pilih material yang terasa halus, tidak kaku, dan tidak membuat gerah. Untuk aktivitas harian, bahan cotton blend yang ringan biasanya lebih ramah untuk kulit dan tetap mudah dirawat.

## Perhatikan potongan baju
Potongan yang terlalu sempit bisa membuat anak cepat tidak nyaman. Cari dress, set, atau romper dengan ruang gerak cukup di bagian lengan, pinggang, dan kaki. Untuk special occasion, detail cantik tetap bisa hadir tanpa mengorbankan kenyamanan.

## Cek detail kecil sebelum membeli
- Jahitan terasa rapi dan tidak kasar di bagian dalam.
- Kancing, zipper, atau aksen dekoratif terpasang kuat.
- Bagian leher dan lengan tidak terlalu ketat.
- Warna dan motif mudah dipadukan dengan item lain.

## Pilih outfit sesuai momennya
Untuk daily wear, prioritaskan bahan adem dan model yang mudah dipakai. Untuk birthday, photoshoot, atau family gathering, mama bisa memilih piece dengan embroidery, lace lembut, atau detail statement yang tetap ringan saat dikenakan.

## Rawat dengan lembut
Kidswear premium akan lebih awet kalau dicuci dengan gentle cycle atau tangan, memakai deterjen lembut, dan dijemur tanpa paparan matahari yang terlalu keras. Simpan dalam keadaan benar-benar kering agar bentuk dan warna tetap cantik.

Pada akhirnya, outfit terbaik adalah yang membuat si kecil terlihat manis sekaligus merasa bebas menjadi dirinya sendiri. Karena momen kecil mereka layak dirayakan dengan pilihan yang nyaman, berkualitas, dan penuh cinta.`,
};

export const defaultBlogPosts = [defaultBlogPost];
