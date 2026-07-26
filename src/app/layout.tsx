import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "অ্যাডমিন প্যানেল | এসো কুরআন শিখি একাডেমি",
    template: "%s | এসো কুরআন শিখি অ্যাডমিন",
  },
  description: "এসো কুরআন শিখি একাডেমির কোর্স ম্যানেজমেন্ট অ্যাডমিন প্যানেল।",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#186447",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="font-bengali antialiased">
        <a href="#main-content" className="skip-link">
          মূল কনটেন্টে যান
        </a>
        <Providers>
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
