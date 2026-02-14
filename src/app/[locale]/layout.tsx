import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DKS StockAlert - Free Open Source Inventory Management Software India',
  description: 'Free open source inventory management software with GST invoicing, WhatsApp alerts, Tally import, and multi-location support. Perfect for Indian small businesses, retailers, and manufacturers.',
  keywords: [
    'free inventory management software India',
    'open source inventory software',
    'stock management system',
    'GST inventory software',
    'warehouse management India',
    'free stock tracking software',
    'inventory alerts',
    'Tally import software',
    'multi-location inventory',
    'small business inventory India'
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DKS StockAlert - Free Open Source Inventory Management Software',
    description: 'Free inventory management with GST invoicing, WhatsApp alerts, and Tally import. Made for Indian businesses.',
    type: 'website',
    locale: 'en_US',
    url: '/',
  },
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
