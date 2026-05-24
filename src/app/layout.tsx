import type { Metadata, Viewport } from "next";
import { Barlow_Condensed } from "next/font/google";
import { ShopFooter } from "@/components/shop-footer";
import { assetPath, siteAssetUrl } from "@/lib/assets";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const qeshtaFont = Barlow_Condensed({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-qeshta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "QESHTA | Sculpted Clothing and Quiet Luxury Essentials",
    template: "%s | QESHTA",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    title: "QESHTA | Sculpted Clothing and Quiet Luxury Essentials",
    description: siteConfig.description,
    images: [
      {
        url: siteAssetUrl("/images/hero-editorial.jpg"),
        width: 1500,
        height: 844,
        alt: "QESHTA burgundy velvet tailoring campaign",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QESHTA | Sculpted Clothing and Quiet Luxury Essentials",
    description: siteConfig.description,
    images: [siteAssetUrl("/images/hero-editorial.jpg")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: assetPath("/favicon.ico"),
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#0b0b0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${qeshtaFont.variable} ${qeshtaFont.className}`}>
      <body>
        {children}
        <ShopFooter />
      </body>
    </html>
  );
}
