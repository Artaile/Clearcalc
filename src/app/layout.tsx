import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://clearcalc.vercel.app'),
  title: {
    default: "ClearCalc — Smart Financial Calculators & Tools",
    template: "%s | ClearCalc"
  },
  description: "Free online financial calculators for EMI, loans, GST, currency conversion, discounts and more. Fast, accurate, and easy-to-use tools for smart financial planning.",
  keywords: [
    "calculator",
    "financial calculator",
    "EMI calculator",
    "loan calculator",
    "GST calculator",
    "currency converter",
    "discount calculator",
    "financial tools",
    "online calculator",
    "free calculator",
    "banking calculator",
    "profit calculator"
  ],
  authors: [{ name: "ClearCalc Team" }],
  creator: "ClearCalc",
  publisher: "ClearCalc",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ClearCalc"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clearcalc.vercel.app",
    title: "ClearCalc — Smart Financial Calculators & Tools",
    description: "Free online financial calculators for EMI, loans, GST, currency conversion, and more. Fast, accurate, and easy-to-use.",
    siteName: "ClearCalc",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "ClearCalc Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearCalc — Smart Financial Calculators & Tools",
    description: "Free online financial calculators for EMI, loans, GST, currency conversion, and more.",
    images: ["/icon.png"],
    creator: "@clearcalc"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'adffb13bfd204fba',
  }
};

export const viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ClearCalc",
              "url": "https://clearcalc.vercel.app",
              "logo": "https://clearcalc.vercel.app/icon.png",
              "description": "Free online financial calculators for EMI, loans, GST, currency conversion, and more."
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ClearCalc",
              "url": "https://clearcalc.vercel.app",
              "description": "Smart financial calculators and tools for everyday needs"
            })
          }}
        />
      </head>
      <body className={`${outfit.className} min-h-screen bg-[#09090b]`}>
        <main className="max-w-[1080px] mx-auto px-4 py-8 sm:py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
