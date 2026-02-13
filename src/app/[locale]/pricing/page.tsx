'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, CheckCircle, HelpCircle, ArrowRight, Zap, Shield, BarChart3, Users, MapPin, Crown, Star, ChevronRight, Check, X, Sparkles, Code2, Database, Cpu, Globe, Server, Lock } from 'lucide-react'

const techStack = [
  { name: 'Next.js', icon: Code2, color: 'text-white' },
  { name: 'React', icon: Globe, color: 'text-cyan-400' },
  { name: 'Cashfree', icon: Lock, color: 'text-blue-400' },
  { name: 'Supabase', icon: Database, color: 'text-green-400' },
  { name: 'TypeScript', icon: Cpu, color: 'text-indigo-400' },
  { name: 'Tailwind', icon: Sparkles, color: 'text-teal-400' },
]

function Marquee({ items }: { items: typeof techStack }) {
  return (
    <div className="relative overflow-hidden">
      <motion.div 
        className="flex gap-12"
        animate={{
          x: [0, -2000],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <div 
            key={`${item.name}-${i}`} 
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <span className="text-white/80 font-medium">{item.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

const plans = [
  {
    name: 'Free',
    display_name: 'Free',
    description: 'Perfect for personal use',
    price: 0,
    price_display: '₹0',
    color: 'from-blue-500 to-blue-600',
    icon: Users,
    features: [
      'Basic inventory tracking',
      '1 team member',
      '10 products',
      '1 location',
      'Stock transfers',
      'Purchase orders',
      'Bulk operations',
      'Advanced analytics',
      'Custom reports',
      'Export to CSV/PDF',
      'API access',
      'Mobile access',
      'In-app notifications',
      'Low stock alerts',
      'Dashboard alerts',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'starter',
    display_name: 'Starter',
    description: 'Great for small businesses',
    price: 499,
    price_display: '₹499',
    color: 'from-violet-500 to-indigo-600',
    icon: BarChart3,
    features: [
      'All features in Free',
      'Up to 3 team members',
      'Up to 100 products',
      'Up to 5 locations',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'pro',
    display_name: 'Professional',
    description: 'For growing businesses',
    price: 1499,
    price_display: '₹1,499',
    color: 'from-violet-500 to-fuchsia-600',
    icon: Crown,
    features: [
      'All features in Starter',
      'Up to 10 team members',
      'Up to 1000 products',
      'Up to 20 locations',
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
  { feature: 'In-App Notifications', free: true, starter: true, pro: true },
  { feature: 'Mobile Access', free: true, starter: true, pro: true },
  { feature: 'Basic Reports', free: true, starter: true, pro: true },
  { feature: 'Advanced Analytics', free: true, starter: true, pro: true },
  { feature: 'Stock Transfers', free: true, starter: true, pro: true },
  { feature: 'Purchase Orders', free: true, starter: true, pro: true },
  { feature: 'Bulk Operations', free: true, starter: true, pro: true },
  { feature: 'Custom Reports', free: true, starter: true, pro: true },
  { feature: 'Export to CSV/PDF', free: true, starter: true, pro: true },
  { feature: 'API Access', free: true, starter: true, pro: true },
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  } as const

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 60,
        damping: 18,
      },
    },
  } as const

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(white 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">DKS StockAlert</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white/60 hover:text-white transition-colors cursor-pointer font-medium">Home</Link>
              <span className="text-violet-400 font-medium px-3 py-2">Pricing</span>
              <Link href="/#how-it-works" className="text-white/60 hover:text-white transition-colors cursor-pointer font-medium">How It Works</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/auth" className="text-white/70 hover:text-white font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
                Sign In
              </Link>
              <Link href="/auth" className="bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-violet-600 hover:to-fuchsia-700 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4 relative">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.4, 0.25],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
            times: [0, 0.5, 1],
          }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl pointer-events-none"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.35, 0.25],
            x: [0, -20, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
            times: [0, 0.5, 1],
            delay: 2,
          }}
        />

        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 text-violet-300 rounded-full text-sm font-semibold mb-8"
              variants={itemVariants}
            >
              <Zap className="w-4 h-4 text-violet-400" />
              30-day free trial - No credit card required
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Simple, Transparent Pricing</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Start free and upgrade when you&apos;re ready. No hidden fees, no surprises.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 border hover:border-violet-500/50 transition-all duration-300 relative group ${plan.popular ? 'border-violet-500/50 ring-2 ring-violet-500/30 shadow-xl shadow-violet-500/10' : 'border-white/10'}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: i * 0.08,
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                }}
                whileHover={{ scale: 1.02, y: -8 }}
              >
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-violet-500/50"
                    animate={{
                      scale: [1, 1.03, 1],
                      boxShadow: [
                        '0 0 20px rgba(139, 92, 246, 0.3)',
                        '0 0 30px rgba(139, 92, 246, 0.5)',
                        '0 0 20px rgba(139, 92, 246, 0.3)',
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.2, 1],
                      times: [0, 0.5, 1],
                    }}
                  >
                    Most Popular
                  </motion.div>
                )}
                  <div className="mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${plan.popular ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20' : 'bg-gradient-to-br from-white/10 to-white/5'} flex items-center justify-center mb-6`}>
                      <plan.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.display_name}</h3>
                    <p className="text-white/60 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">{plan.price_display}</span>
                      <span className="text-white/60">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full ${plan.popular ? 'bg-violet-500/20' : 'bg-green-500/20'} flex items-center justify-center flex-shrink-0`}>
                          <CheckCircle className={`w-3.5 h-3.5 ${plan.popular ? 'text-violet-400' : 'text-green-400'}`} />
                        </div>
                        <span className="text-white/60 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth"
                    className={`block w-full py-3.5 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${plan.popular 
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white hover:from-violet-600 hover:to-fuchsia-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40' 
                      : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'}`}
                  >
                    {plan.cta}
                  </Link>
                  {plan.price === 0 && (
                    <p className="text-center text-white/50 text-sm mt-4">No credit card required</p>
                  )}
                  {plan.price > 0 && (
                    <p className="text-center text-white/50 text-sm mt-4 flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4 text-violet-400" />
                      30-day free trial, no credit card • UPI accepted
                    </p>
                  )}
              </motion.div>
             ))}
           </motion.div>
           <motion.div
             className="mt-8 text-center"
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
           >
             <p className="text-white/50 text-sm mb-2">Accepts UPI, GPay, PhonePe, Net Banking & Credit Cards</p>
             <div className="flex items-center justify-center gap-2">
               <Shield className="w-4 h-4 text-green-400" />
               <span className="text-white/60 text-sm">Powered by Cashfree • Secure Payments</span>
             </div>
           </motion.div>

           <motion.div
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden mb-20 mt-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-8 md:p-10 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent text-center">Feature Comparison</h2>
              <p className="text-white/60 text-center mt-2">See exactly what&apos;s included in each plan</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left py-5 px-6 font-semibold text-white">Feature</th>
                    <th className="text-center py-5 px-6 font-semibold text-white">Free</th>
                    <th className="text-center py-5 px-6 font-semibold text-white">Starter</th>
                    <th className="text-center py-5 px-6 font-semibold text-violet-400 bg-violet-500/10">Professional</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) => (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-white font-medium">{row.feature}</td>
                      <td className="text-center py-4 px-6">
                        {typeof row.free === 'boolean' ? (
                          row.free ? (
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                              <X className="w-4 h-4 text-white/30" />
                            </div>
                          )
                        ) : (
                          <span className="text-white/80 font-semibold">{row.free}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-6">
                        {typeof row.starter === 'boolean' ? (
                          row.starter ? (
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                              <X className="w-4 h-4 text-white/30" />
                            </div>
                          )
                        ) : (
                          <span className="text-white/80 font-semibold">{row.starter}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-6 bg-violet-500/5">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? (
                            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto">
                              <CheckCircle className="w-4 h-4 text-violet-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                              <X className="w-4 h-4 text-white/30" />
                            </div>
                          )
                        ) : (
                          <span className="text-violet-400 font-bold">{row.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div 
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {faqs.map((faq, i) => (
                <motion.div 
                  key={i} 
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-violet-500/30 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    delay: i * 0.05,
                    duration: 0.6,
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center flex-shrink-0 border border-violet-500/30">
                      <HelpCircle className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2 text-lg">{faq.question}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-violet-600/90 to-fuchsia-600/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden border border-white/10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ 
              duration: 0.9,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
            <div className="relative">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join 500+ businesses already using DKS StockAlert to manage their inventory.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth" className="w-full sm:w-auto bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="text-white/60 text-sm mt-6 flex items-center justify-center gap-2">
                <motion.span 
                  className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                    times: [0, 0.5, 1],
                  }}
                />
                No credit card required • UPI/Net Banking accepted • Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <section className="py-12 border-y border-white/5 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-white/60 mb-6 font-medium text-sm">Built with modern technologies</p>
          <Marquee items={techStack} />
        </div>
      </section>

      <footer className="bg-slate-950/50 backdrop-blur-sm border-t border-white/5 text-white/60 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">DKS StockAlert</span>
              </Link>
              <p className="text-sm leading-relaxed">
                Smart inventory management for growing businesses. Track stock, manage suppliers, never run out.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Privacy Policy <ChevronRight className="w-3 h-3" /></Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Terms of Service <ChevronRight className="w-3 h-3" /></Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">Cookie Policy <ChevronRight className="w-3 h-3" /></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-sm">© {new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
              <p className="text-xs text-white/40 flex items-center gap-1">
                Made with ❤️ in India • <span className="text-violet-400">ISO 27001 Certified</span> • Data stored in India
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Powered by Cashfree</span>
              </div>
              <a href="#" className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
