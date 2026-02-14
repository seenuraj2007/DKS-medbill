import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Free & Open Source Inventory Management Software India',
  description: 'DKS StockAlert pricing plans. Start free with our open source inventory management software. Upgrade to Pro for unlimited products, locations, and priority support. No hidden fees. GST compliant.',
  keywords: [
    'inventory software pricing',
    'free inventory management',
    'open source inventory pricing',
    'stock management software cost',
    'GST inventory software price',
    'inventory management plans India',
    'free stock tracking software',
    'inventory software subscription'
  ],
  openGraph: {
    title: 'DKS StockAlert Pricing - Free Open Source Inventory Software',
    description: 'Free forever plan available. Upgrade to Pro for unlimited features. No hidden fees. GST compliant inventory management.',
    type: 'website',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
