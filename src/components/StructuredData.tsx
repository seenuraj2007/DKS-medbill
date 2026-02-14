import Script from 'next/script'

interface StructuredDataProps {
  type: 'organization' | 'website' | 'product' | 'faq' | 'breadcrumb'
  data?: Record<string, unknown>
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stockalert-seven.vercel.app'

  const structuredData = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'DKS StockAlert',
      alternateName: 'StockAlert',
      url: baseUrl,
      logo: `${baseUrl}/icon.svg`,
      sameAs: [
        'https://github.com/seenuraj2007/stockalert',
      ],
      description: 'Free open source inventory management software for small businesses in India. Features GST invoicing, WhatsApp alerts, Tally import, and multi-location support.',
      founder: {
        '@type': 'Person',
        name: 'DKS StockAlert Team',
      },
      foundingDate: '2024',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: ['English', 'Hindi'],
      },
    },
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'DKS StockAlert',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    product: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'DKS StockAlert',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Real-time stock tracking',
        'Multi-location management',
        'GST invoicing',
        'WhatsApp alerts',
        'Tally import',
        'Barcode generation',
        'Purchase orders',
        'Low stock alerts',
      ],
      ...data,
    },
    faq: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is DKS StockAlert really free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! DKS StockAlert is open source and free to use. You can self-host it or use our cloud version. We offer a free tier with generous limits, and paid plans for businesses that need more features.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I import data from Tally?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely! DKS StockAlert supports 1-click Tally import. You can easily migrate your products, stock levels, and GST details from Tally to StockAlert in seconds.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is DKS StockAlert GST compliant?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, DKS StockAlert is fully GST compliant. You can generate GST invoices with HSN codes, tax breakdowns, and e-way bill integration. Perfect for Indian businesses.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does it support multiple warehouses?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, you can manage stock across multiple godowns, shops, and warehouses from a single dashboard. Track inventory levels at each location and transfer stock between locations.',
          },
        },
      ],
    },
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: data?.items || [],
    },
  }

  const jsonLd = structuredData[type]

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      strategy="afterInteractive"
    />
  )
}

// Predefined structured data components
export function OrganizationStructuredData() {
  return <StructuredData type="organization" />
}

export function WebsiteStructuredData() {
  return <StructuredData type="website" />
}

export function ProductStructuredData(data?: Record<string, unknown>) {
  return <StructuredData type="product" data={data} />
}

export function FAQStructuredData() {
  return <StructuredData type="faq" />
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const breadcrumbItems = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  }))

  return <StructuredData type="breadcrumb" data={{ items: breadcrumbItems }} />
}
