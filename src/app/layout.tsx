import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lemurianFont = localFont({
  src: "../fonts/LemurianTrueType-Regular.ttf",
  variable: "--font-lemurian",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Konversi Aksara Lemuria - Lemurian True Type",
  description: "Aplikasi konverter teks dua arah antara tulisan Latin dan Aksara Lemuria menggunakan font asli Lemurian True Type, lengkap dengan tabel karakter dan ekspor gambar PNG.",
  keywords: ["Aksara Lemuria", "Lemurian True Type", "Konversi Aksara Lemuria", "ArkhyTirema", "Konverter Teks"],
  openGraph: {
    title: "Konversi Aksara Lemuria",
    description: "Konversi teks Latin ke Aksara Lemuria dan sebaliknya dengan font asli Lemurian True Type.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Konversi Aksara Lemuria",
    description: "Konversi teks Latin ke Aksara Lemuria dan sebaliknya dengan font asli Lemurian True Type.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lemurianFont.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
