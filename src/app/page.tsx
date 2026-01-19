import Link from 'next/link'
import { Package, TrendingDown, AlertTriangle, Bell, Users, MapPin, Truck, BarChart3, Shield, Zap, ArrowRight, CheckCircle, Star, ChevronRight, Sparkles, Target, Layers } from 'lucide-react'

export const metadata = {
  title: 'StockAlert - Smart Inventory Management for Growing Businesses',
  description: 'Track stock levels, manage suppliers, and never run out of inventory. Free for small teams, powerful for growing businesses.',
}

const stats = [
  { label: 'Total Products', value: '1,247', change: '+12%', color: 'from-blue-500 to-blue-600', Icon: Package },
  { label: 'Low Stock', value: '23', change: '-5', color: 'from-yellow-500 to-orange-500', Icon: TrendingDown },
  { label: 'Out of Stock', value: '5', change: '-2', color: 'from-red-500 to-red-600', Icon: AlertTriangle },
  { label: 'This Month', value: '+$48,320', change: '+8%', color: 'from-green-500 to-green-600', Icon: BarChart3 },
]

const alerts = [
  { name: 'Wireless Mouse', stock: 5, reorder: 20, status: 'critical' },
  { name: 'USB-C Cable', stock: 8, reorder: 50, status: 'warning' },
  { name: 'Notebook A5', stock: 12, reorder: 100, status: 'warning' },
]

const features = [
  {
    icon: Package,
    title: 'Product Tracking',
    description: 'Track all products with barcode support, categories, and detailed stock levels across locations.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: MapPin,
    title: 'Multi-Location',
    description: 'Manage inventory across multiple warehouses, stores, or locations from one dashboard.',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified when stock runs low or hits zero. Never miss a restock opportunity.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: TrendingDown,
    title: 'Stock Analytics',
    description: 'Visual reports on stock movement, trends, and forecasts to make data-driven decisions.',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: Truck,
    title: 'Supplier Management',
    description: 'Manage suppliers, track purchase orders, and streamline your supply chain.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite team members with role-based access. Track who made what changes.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Layers,
    title: 'Stock Transfers',
    description: 'Move inventory between locations seamlessly with tracking and approval workflows.',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    icon: Target,
    title: 'Purchase Orders',
    description: 'Create, track, and manage purchase orders with automatic stock updates.',
    color: 'from-violet-500 to-violet-600'
  },
  {
    icon: Sparkles,
    title: 'Bulk Operations',
    description: 'Update multiple products at once with bulk import/export and batch operations.',
    color: 'from-amber-500 to-amber-600'
  },
]

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up with your email. No credit card required for the 30-day trial.' },
  { step: '02', title: 'Add Products', desc: 'Import your products or add them one by one with barcode support.' },
  { step: '03', title: 'Start Tracking', desc: 'Get instant alerts, track stock levels, and manage your inventory smarter.' },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for personal use',
    features: ['1 team member', '10 products', '1 location', 'Basic tracking', 'Email support'],
    color: 'from-blue-500 to-blue-600',
    cta: 'Get Started Free',
    ctaClass: 'text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
  },
  {
    name: 'Starter',
    price: '$9',
    description: 'Great for small businesses',
    features: ['3 team members', '100 products', '5 locations', 'Priority email support'],
    color: 'from-indigo-500 to-indigo-600',
    cta: 'Start Free Trial',
    ctaClass: 'text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
  },
  {
    name: 'Professional',
    price: '$29',
    description: 'For growing businesses',
    features: ['10 team members', '1000 products', '20 locations', 'Stock transfers', 'Priority support'],
    color: 'from-purple-500 to-purple-600',
    cta: 'Start Free Trial',
    ctaClass: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg',
    popular: true,
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Operations Manager',
    company: 'TechShop Retail',
    content: 'StockAlert transformed how we manage inventory. We reduced stockouts by 90% in the first month!',
    avatar: 'bg-gradient-to-br from-blue-400 to-blue-600'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Warehouse Director',
    company: 'FastShip Logistics',
    content: 'The multi-location feature is a game-changer. Managing 5 warehouses has never been easier.',
    avatar: 'bg-gradient-to-br from-green-400 to-green-600'
  },
  {
    name: 'Emily Watson',
    role: 'Small Business Owner',
    company: 'Boutique Shop',
    content: 'Perfect for small businesses. Easy to use, great support, and the free plan covers everything I need.',
    avatar: 'bg-gradient-to-br from-purple-400 to-purple-600'
  },
]

const brands = ['TechCorp', 'ShopSmart', 'WareHouse+', 'RetailPro', 'BusinessHub']

export default function HomePage() {
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
              <a href="#features" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all cursor-pointer font-medium">Features</a>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all cursor-pointer font-medium">Pricing</Link>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all cursor-pointer font-medium">Testimonials</a>
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

      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50"></div>
        <div className="absolute top-20 right-10 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-semibold mb-8 border border-indigo-200">
              <Zap className="w-4 h-4" />
              Now with 30-day free trial - No credit card required
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Inventory Management for
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent block mt-2">
                Growing Businesses
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Track stock levels, manage suppliers, and never run out of inventory. 
              Free for small teams, powerful features for growing businesses.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth" className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
                See How It Works
              </a>
            </div>
            
            <p className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Free 30-day trial • No credit card required • Cancel anytime
            </p>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mx-4 lg:mx-0 lg:max-w-5xl lg:mx-auto transform hover:scale-[1.01] transition-transform duration-500">
              <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {stats.map((stat, i) => {
                    const IconComponent = stat.Icon
                    const gradientClass = 'w-10 h-10 rounded-lg bg-gradient-to-br ' + stat.color + ' flex items-center justify-center mb-3 shadow-lg'
                    return (
                      <div key={i} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
                        <div className={gradientClass}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                        </div>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                      </div>
                    )
                  })}
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
                    <span className="text-sm text-indigo-600 font-medium cursor-pointer hover:text-indigo-700">View All</span>
                  </div>
                  {alerts.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.stock} / {item.reorder} units</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status === 'critical' ? 'Critical' : 'Low Stock'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-500 mb-8 font-medium">Trusted by 500+ growing businesses worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40">
            {brands.map((brand, i) => (
              <span key={i} className="text-xl font-bold text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3 block">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Everything You Need to Manage Inventory</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Powerful features to track, manage, and optimize your inventory across all locations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const IconComponent = feature.icon
              const gradientClass = 'w-14 h-14 rounded-2xl bg-gradient-to-br ' + feature.color + ' flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300'
              return (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                  <div className={gradientClass}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-indigo-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Get Started in Minutes</h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Start tracking your inventory in 3 simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="text-center relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-white/20">
                    <div className="absolute right-0 -top-1.5 w-3 h-3 bg-white/40 rounded-full"></div>
                  </div>
                )}
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-xl">
                  <span className="text-3xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-indigo-100 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3 block">Pricing</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you're ready.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, i) => {
              const cardClass = 'bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 relative' + (plan.popular ? ' ring-2 ring-indigo-500' : '')
              const gradientClass = 'w-14 h-14 rounded-2xl bg-gradient-to-br ' + plan.color + ' flex items-center justify-center mb-6 shadow-lg'
              const ctaClass = plan.ctaClass
              return (
                <div key={i} className={cardClass}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-semibold rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <div className={gradientClass}>
                    <span className="text-white font-bold text-xl">{plan.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth" className={'block w-full py-3.5 px-6 text-center font-semibold rounded-xl transition-all duration-300 ' + ctaClass}>
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3 block">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Loved by Businesses</h2>
            <p className="text-xl text-gray-600">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${testimonial.avatar}`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join 500+ businesses already using StockAlert to manage their inventory.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth" className="w-full sm:w-auto bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">
                  Start Free Trial
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="text-indigo-200 text-sm mt-6 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                No credit card required • 30-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

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
                <li><a href="#features" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Features <ChevronRight className="w-3 h-3" /></a></li>
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
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
