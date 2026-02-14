import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stockalert-seven.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/en',
          '/en/about',
          '/en/pricing',
          '/en/features',
          '/en/blog',
          '/en/contact',
          '/en/terms',
          '/en/privacy',
          '/en/cookies',
          '/api-docs',
        ],
        disallow: [
          '/api/',
          '/en/dashboard',
          '/en/products',
          '/en/locations',
          '/en/stock-transfers',
          '/en/purchase-orders',
          '/en/invoices',
          '/en/team',
          '/en/settings',
          '/en/analytics',
          '/en/alerts',
          '/en/profile',
          '/en/billing',
          '/en/subscription',
          '/en/onboarding',
          '/en/offline',
          '/en/auth/verify-email',
          '/en/auth/reset-password',
          '/en/auth/forgot-password',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/en',
          '/en/about',
          '/en/pricing',
          '/en/features',
          '/en/blog',
          '/en/contact',
        ],
        disallow: ['/api/', '/en/dashboard/', '/en/products/', '/en/settings/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/',
          '/icon.svg',
          '/og-image.png',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
