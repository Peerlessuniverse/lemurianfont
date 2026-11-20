# Konversi Aksara Lemuria

Aplikasi web untuk mengonversi teks dua arah antara tulisan **Latin** dan **Aksara Lemuria** menggunakan font **Lemurian True Type**, dilengkapi pratinjau real-time, panduan karakter interaktif, serta ekspor gambar siap tempel.

## Fitur Utama

- **Konversi Real-time Dua Arah**: Ketik di kolom Latin atau Lemuria dan lihat hasilnya seketika, dengan tombol tukar posisi di tengah antara kedua panel.
- **Font Asli Lemurian True Type**: Menggunakan `LemurianTrueType-Regular.ttf` dengan arah penulisan kanan ke kiri (RTL), pilihan variasi gaya tampilan, serta pengaturan ukuran font (`18px`–`56px`).
- **Salin Gambar & Unduh PNG**: Menyalin hasil tulisan Aksara Lemuria sebagai gambar ke clipboard atau mengunduhnya dalam format PNG agar bentuk aksara tidak berubah saat dibagikan ke aplikasi lain.
- **Unduh Font (`.ttf`)**: Tautan unduhan langsung file font untuk dipasang dan digunakan di aplikasi pengolah kata maupun desain grafis.
- **Panduan Karakter Interaktif**: Tabel 46 karakter yang didukung (`A–Z`, `0–9`, dan tanda baca/khusus) yang dapat diklik untuk menyisipkan karakter langsung ke editor.
- **UI Responsif & Glassmorphism**: Desain bersih bernuansa putih dan biru muda yang menyesuaikan tampilan desktop maupun mobile.

## Teknologi

- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling & Komponen**: Tailwind CSS v4, Radix UI / shadcn/ui, Lucide React
- **Server**: Custom Node.js HTTP Server (`server.ts`) dengan `tsx` dan integrasi Socket.IO

## Cara Menjalankan di Lokal

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembangan
npm run dev
```

Atau jalankan server secara langsung:

```bash
npx tsx server.ts
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### Build Produksi

```bash
npm run build
npm start
```

## Struktur Proyek

```text
├── public/
│   └── fonts/
│       ├── LemurianTrueType-Regular.otf
│       └── LemurianTrueType-Regular.ttf
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── convert/route.ts
│   │   │   └── health/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/ui/
│   ├── fonts/
│   │   └── LemurianTrueType-Regular.ttf
│   ├── hooks/
│   └── lib/
└── server.ts
```
