import Link from 'next/link'
import { Package, ArrowLeft, Puzzle, ShoppingCart, Zap, Globe, Database, CreditCard, MessageSquare, BarChart3 } from 'lucide-react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Integrations - Connect DKS StockAlert with Your Tools | Tally, WhatsApp, Shopify',
  description: 'Integrate DKS StockAlert with Tally, WhatsApp Business, Shopify, WooCommerce, Cashfree, and more. Connect your existing tools for seamless inventory management and automated workflows.',
  keywords: ['inventory software integrations', 'Tally integration', 'WhatsApp inventory alerts', 'Shopify inventory sync', 'WooCommerce stock management', 'Cashfree billing integration', 'inventory API'],
  openGraph: {
    title: 'DKS StockAlert Integrations - Connect Your Business Tools',
    description: 'Seamlessly integrate with Tally, WhatsApp, Shopify, and 20+ other business tools. Automate your inventory workflows.',
    type: 'website',
  },
}

const integrations = [
  {
    name: 'Cashfree',
    description: 'Seamless payment processing and billing',
    icon: CreditCard,
    color: 'from-blue-500 to-cyan-500',
    status: 'Available',
    features: ['Automatic invoicing', 'Payment reconciliation', 'Subscription management', 'GST compliant'],
  },
  {
    name: 'WhatsApp Business',
    description: 'Send alerts and notifications via WhatsApp',
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-500',
    status: 'Coming Soon',
    features: ['Low stock alerts', 'Order updates', 'Team notifications', 'Custom messaging'],
  },
  {
    name: 'Zoho Commerce',
    description: 'Sync products with Zoho platform',
    icon: ShoppingCart,
    color: 'from-purple-500 to-violet-500',
    status: 'Available',
    features: ['Product sync', 'Order management', 'Inventory sync', 'Multi-channel support'],
  },
  {
    name: 'Shopify',
    description: 'Connect your Shopify store',
    icon: Globe,
    color: 'from-green-500 to-teal-500',
    status: 'Coming Soon',
    features: ['Product import', 'Inventory sync', 'Order tracking', 'Analytics integration'],
  },
  {
    name: 'Google Sheets',
    description: 'Export and analyze your data',
    icon: Database,
    color: 'from-green-600 to-emerald-600',
    status: 'Available',
    features: ['Real-time sync', 'Custom reports', 'Data analysis', 'Collaboration'],
  },
  {
    name: 'Slack',
    description: 'Team notifications in Slack',
    icon: Zap,
    color: 'from-purple-600 to-indigo-600',
    status: 'Coming Soon',
    features: ['Stock alerts', 'Team chat', 'Custom webhooks', 'Notification channels'],
  },
]

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DKS StockAlert</span>
            </Link>
            <Link href="/auth" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 mx-auto mb-6">
              <Puzzle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Integrations</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect DKS StockAlert with your favorite tools and automate your inventory management workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div key={integration.name} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 overflow-hidden hover:shadow-2xl transition-shadow">
                <div className={`p-6 bg-gradient-to-br ${integration.color}`}>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                    <integration.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{integration.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${integration.status === 'Available'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/30 text-white/80'
                      }`}>
                      {integration.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{integration.description}</p>
                  <ul className="space-y-2">
                    {integration.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-4 w-full py-2.5 rounded-xl font-semibold transition-all ${integration.status === 'Available'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    disabled={integration.status !== 'Available'}
                  >
                    {integration.status === 'Available' ? 'Connect' : 'Coming Soon'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Need a Custom Integration?</h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              We can help you build custom integrations with your existing systems. Contact our team to discuss your requirements.
            </p>
            <Link
              href="/auth"
              className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
