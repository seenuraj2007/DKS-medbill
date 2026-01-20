import Link from 'next/link'
import { Package, CheckCircle, HelpCircle, ArrowRight, Zap, Shield, BarChart3, Users, MapPin, Crown, Star, ChevronRight, Check, X } from 'lucide-react'

export const metadata = {
  title: 'Pricing - StockAlert',
  description: 'Simple, transparent pricing for StockAlert inventory management.',
}

const plans = [
  {
    name: 'Free',
    display_name: 'Free',
    description: 'Perfect for personal use',
    price: 0,
    color: 'from-blue-500 to-blue-600',
    icon: Users,
    features: [
      'Basic inventory tracking',
      '1 team member',
      '10 products',
      '1 location',
      'Email support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'starter',
    display_name: 'Starter',
    description: 'Great for small businesses',
    price: 9,
    color: 'from-indigo-500 to-indigo-600',
    icon: BarChart3,
    features: [
      'All features in Free',
      'Up to 3 team members',
      'Up to 100 products',
      'Up to 5 locations',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'pro',
    display_name: 'Professional',
    description: 'For growing businesses',
    price: 29,
    color: 'from-purple-500 to-purple-600',
    icon: Crown,
    features: [
      'All features in Starter',
      'Up to 10 team members',
      'Up to 1000 products',
      'Up to 20 locations',
      'Stock transfers',
      'Purchase orders',
      'Bulk operations',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
]

const comparisonFeatures = [
  { feature: 'Team Members', free: '1', starter: '3', pro: '10' },
  { feature: 'Products', free: '10', starter: '100', pro: '1000' },
  { feature: 'Locations', free: '1', starter: '5', pro: '20' },
  { feature: 'Inventory Tracking', free: true, starter: true, pro: true },
  { feature: 'Low Stock Alerts', free: true, starter: true, pro: true },
  { feature: 'Email Notifications', free: true, starter: true, pro: true },
  { feature: 'Mobile Access', free: true, starter: true, pro: true },
  { feature: 'Basic Reports', free: true, starter: true, pro: true },
  { feature: 'Advanced Analytics', free: false, starter: false, pro: true },
  { feature: 'Stock Transfers', free: false, starter: false, pro: true },
  { feature: 'Purchase Orders', free: false, starter: false, pro: true },
  { feature: 'Bulk Operations', free: false, starter: false, pro: true },
  { feature: 'Custom Reports', free: false, starter: false, pro: true },
  { feature: 'Export to CSV/PDF', free: false, starter: true, pro: true },
  { feature: 'API Access', free: false, starter: false, pro: true },
  { feature: 'Priority Support', free: false, starter: true, pro: true },
]

const faqs = [
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All new accounts get a 30-day free trial of our Professional plan. No credit card required. At the end of the trial, you can choose to continue with Professional or switch to a lower plan.',
  },
  {
    question: 'Can I change plans at any time?',
    answer: 'Absolutely. You can upgrade or downgrade your plan at any time. When upgrading, you\'ll get immediate access to new features. When downgrading, changes take effect at your next billing cycle.',
  },
  {
    question: 'What happens when I exceed my plan limits?',
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
    answer: 'We offer a 30-day money-back guarantee for new Professional subscriptions. If you\'re not satisfied, contact support within 30 days of your purchase for a full refund.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockAlert</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all cursor-pointer font-medium">Features</Link>
              <span className="text-indigo-600 font-medium px-3 py-2">Pricing</span>
              <Link href="/#testimonials" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all cursor-pointer font-medium">Testimonials</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/auth" className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                Sign In
              </Link>
              <Link href="/auth" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-semibold mb-6 border border-indigo-200">
              <Zap className="w-4 h-4" />
              30-day free trial - No credit card required
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Start free and upgrade when you&apos;re ready. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 relative ${
                  plan.popular ? 'ring-2 ring-indigo-500 shadow-xl' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-semibold rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                    <plan.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.display_name}</h3>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500 text-lg">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth"
                  className={`block w-full py-4 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                      : 'text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Link>
                {plan.price === 0 && (
                  <p className="text-center text-gray-500 text-sm mt-4">No credit card required</p>
                )}
                {plan.price > 0 && (
                  <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    30-day free trial, no credit card
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-20">
            <div className="p-8 md:p-10 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-3xl font-bold text-gray-900 text-center">Feature Comparison</h2>
              <p className="text-gray-600 text-center mt-2">See exactly what&apos;s included in each plan</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="text-left py-5 px-6 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-5 px-6 font-semibold text-gray-900">Free</th>
                    <th className="text-center py-5 px-6 font-semibold text-gray-900">Starter</th>
                    <th className="text-center py-5 px-6 font-semibold text-indigo-600 bg-indigo-50/50">Professional</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) => (
                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-gray-700 font-medium">{row.feature}</td>
                      <td className="text-center py-4 px-6">
                        {typeof row.free === 'boolean' ? (
                          row.free ? (
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                              <X className="w-4 h-4 text-gray-400" />
                            </div>
                          )
                        ) : (
                          <span className="text-gray-700 font-semibold">{row.free}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-6">
                        {typeof row.starter === 'boolean' ? (
                          row.starter ? (
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                              <X className="w-4 h-4 text-gray-400" />
                            </div>
                          )
                        ) : (
                          <span className="text-gray-700 font-semibold">{row.starter}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-6 bg-indigo-50/30">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mx-auto">
                              <Check className="w-4 h-4 text-indigo-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                              <X className="w-4 h-4 text-gray-400" />
                            </div>
                          )
                        ) : (
                          <span className="text-indigo-600 font-bold">{row.pro}</span>
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
            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{faq.question}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join 500+ businesses already using StockAlert to manage their inventory.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth" className="w-full sm:w-auto bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="text-indigo-200 text-sm mt-6 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                No credit card required • 30-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">StockAlert</span>
              </Link>
              <p className="text-sm leading-relaxed">
                Smart inventory management for growing businesses. Track stock, manage suppliers, never run out.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/#features" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Features <ChevronRight className="w-3 h-3" /></Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Pricing <ChevronRight className="w-3 h-3" /></Link></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">API Docs <ChevronRight className="w-3 h-3" /></a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Integrations <ChevronRight className="w-3 h-3" /></a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">About <ChevronRight className="w-3 h-3" /></a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Blog <ChevronRight className="w-3 h-3" /></a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Careers <ChevronRight className="w-3 h-3" /></a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Contact <ChevronRight className="w-3 h-3" /></a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Privacy Policy <ChevronRight className="w-3 h-3" /></Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Terms of Service <ChevronRight className="w-3 h-3" /></Link></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Cookie Policy <ChevronRight className="w-3 h-3" /></a></li>
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
