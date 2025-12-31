import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "ClearCalc — The Best Financial Tools",
  description: "A suite of premium, fast, and simple calculators for everyday needs.",
  manifest: "/manifest.json",
  themeColor: "#09090b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} min-h-screen bg-[#09090b]`}>
        <main className="max-w-[1080px] mx-auto px-4 py-8 sm:py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
