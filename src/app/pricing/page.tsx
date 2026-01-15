import Link from 'next/link'
import { Package, CheckCircle, HelpCircle, ArrowRight, Zap, Shield, BarChart3, Users, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Pricing - StockAlert',
  description: 'Simple, transparent pricing for StockAlert inventory management.',
}

const features = [
  { feature: 'Products', free: '50', pro: 'Unlimited' },
  { feature: 'Team Members', free: '2', pro: 'Unlimited' },
  { feature: 'Locations', free: '1', pro: 'Unlimited' },
  { feature: 'Inventory Tracking', free: true, pro: true },
  { feature: 'Low Stock Alerts', free: true, pro: true },
  { feature: 'Email Notifications', free: true, pro: true },
  { feature: 'Mobile Access', free: true, pro: true },
  { feature: 'Basic Reports', free: true, pro: true },
  { feature: 'Advanced Analytics', free: false, pro: true },
  { feature: 'Custom Reports', free: false, pro: true },
  { feature: 'Export to CSV/PDF', free: false, pro: true },
  { feature: 'API Access', free: false, pro: true },
  { feature: 'Priority Support', free: false, pro: true },
  { feature: 'SSO Integration', free: false, pro: true },
  { feature: 'Custom Integrations', free: false, pro: true },
]

const faqs = [
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All new accounts get a 30-day free trial of our Pro plan. No credit card required. At the end of the trial, you can choose to continue with Pro or switch to Free.',
  },
  {
    question: 'Can I change plans at any time?',
    answer: 'Absolutely. You can upgrade or downgrade your plan at any time. When upgrading, you\'ll get immediate access to new features. When downgrading, changes take effect at your next billing cycle.',
  },
  {
    question: 'What happens when I exceed my Free plan limits?',
    answer: 'We\'ll notify you when you\'re approaching your limits. You won\'t be locked out immediately, giving you time to upgrade or manage your data. For security, we do enforce hard limits on team members.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use industry-standard encryption to protect your data both in transit and at rest. We also perform regular security audits and have backup systems in place.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel anytime. Your account will remain active until the end of your current billing period. After that, you\'ll be moved to the Free plan.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee for new Pro subscriptions. If you\'re not satisfied, contact support within 30 days of your purchase for a full refund.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockAlert</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <span className="text-indigo-600 font-medium">Pricing</span>
              <Link href="/#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/auth" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/auth" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              30-day free trial - No credit card required
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and upgrade when you're ready. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                  <p className="text-gray-600">Perfect for getting started</p>
                </div>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500 text-lg">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Up to 2 team members',
                  'Up to 50 products',
                  '1 location',
                  'Basic inventory tracking',
                  'Low stock alerts',
                  'Email notifications',
                  'Mobile access',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth" className="block w-full py-4 px-6 text-center text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                Get Started Free
              </Link>
              <p className="text-center text-gray-500 text-sm mt-4">No credit card required</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-10 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-semibold rounded-full">
                Most Popular
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Pro</h3>
                  <p className="text-indigo-200">For growing businesses</p>
                </div>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-indigo-200 text-lg">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited team members',
                  'Unlimited products',
                  'Unlimited locations',
                  'Advanced analytics',
                  'Custom reports',
                  'Export to CSV/PDF',
                  'API access',
                  'Priority support',
                  'SSO integration',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth" className="block w-full py-4 px-6 text-center text-indigo-600 font-semibold rounded-xl bg-white hover:bg-gray-100 transition-all shadow-lg">
                Start Free Trial
              </Link>
              <p className="text-center text-indigo-200 text-sm mt-4">30-day free trial, no credit card</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-20">
            <div className="p-8 md:p-10 border-b border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 text-center">Feature Comparison</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                    <th className="text-center py-4 px-6 font-semibold text-indigo-600">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((row, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-4 px-6 text-gray-700">{row.feature}</td>
                      <td className="text-center py-4 px-6">
                        {typeof row.free === 'boolean' ? (
                          row.free ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )
                        ) : (
                          <span className="text-gray-700 font-medium">{row.free}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-6">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? (
                            <CheckCircle className="w-5 h-5 text-indigo-500 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )
                        ) : (
                          <span className="text-indigo-600 font-medium">{row.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join 500+ businesses already using StockAlert to manage their inventory.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth" className="w-full sm:w-auto bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-indigo-200 text-sm mt-6">No credit card required • 30-day free trial • Cancel anytime</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">StockAlert</span>
              </Link>
              <p className="text-sm">
                Smart inventory management for growing businesses. Track stock, manage suppliers, never run out.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm">© {new Date().getFullYear()} StockAlert. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
