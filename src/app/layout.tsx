import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";

const body = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const display = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "সাইম ও ফাইমের সুন্নাতে খাতনা",
  description: "সুন্নাতে খাতনা অনুষ্ঠানের সম্মানী ও উপহারের তালিকা",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0D3B2E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${body.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
