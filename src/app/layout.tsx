import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { OrganizationStructuredData, WebsiteStructuredData } from "@/components/StructuredData";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://stockalert-seven.vercel.app"),
  title: {
    default: "DKS StockAlert - Free Open Source Inventory Management Software India",
    template: "%s | DKS StockAlert"
  },
  description: "DKS StockAlert is the best free open source inventory management software in India. Track stock levels, get low stock alerts, manage multiple warehouses, GST invoicing, Tally import, and WhatsApp alerts. Perfect for small businesses, retailers, and manufacturers.",
  keywords: [
    "inventory management software",
    "free inventory software India",
    "open source inventory management",
    "stock management software",
    "GST inventory software",
    "warehouse management system",
    "stock tracking software",
    "inventory alerts",
    "Tally import",
    "small business inventory",
    "retail inventory management",
    "stock control software",
    "inventory management system India"
  ],
  authors: [{ name: "DKS StockAlert", url: "https://github.com/seenuraj2007" }],
  creator: "DKS StockAlert",
  publisher: "DKS StockAlert",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "en-GB": "/en",
      "hi-IN": "/hi",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://stockalert-seven.vercel.app",
    siteName: "DKS StockAlert",
    title: "DKS StockAlert - Free Open Source Inventory Management Software",
    description: "Free open source inventory management software with GST invoicing, WhatsApp alerts, Tally import, and multi-location support. Perfect for Indian businesses.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@dksstockalert",
    creator: "@dksstockalert",
    title: "DKS StockAlert - Free Open Source Inventory Management",
    description: "Free open source inventory management software with GST invoicing, WhatsApp alerts, and Tally import.",
    images: ["/og-image.png"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DKS StockAlert",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "business",
  classification: "inventory management software",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <OrganizationStructuredData />
        <WebsiteStructuredData />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
