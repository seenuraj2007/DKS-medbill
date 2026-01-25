'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useState } from 'react'
import { 
  Package, TrendingDown, AlertTriangle, Bell, Users, MapPin, 
  Truck, BarChart3, Shield, Zap, ArrowRight, CheckCircle, 
  ChevronRight, Layers, Target, Sparkles, Cpu, Lock, 
  Database, Code2, Globe, Server 
} from 'lucide-react'

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
    size: 'wide',
    glow: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified when stock runs low or hits zero. Never miss a restock opportunity.',
    size: 'small',
    glow: 'from-purple-500/20 to-pink-500/20'
  },
  {
    icon: MapPin,
    title: 'Multi-Location',
    description: 'Manage inventory across multiple warehouses, stores, or locations from one dashboard.',
    size: 'small',
    glow: 'from-indigo-500/20 to-violet-500/20'
  },
  {
    icon: Truck,
    title: 'Supplier Management',
    description: 'Manage suppliers, track purchase orders, and streamline your supply chain.',
    size: 'small',
    glow: 'from-orange-500/20 to-red-500/20'
  },
  {
    icon: Layers,
    title: 'Stock Transfers',
    description: 'Move inventory between locations seamlessly with tracking and approval workflows.',
    size: 'small',
    glow: 'from-cyan-500/20 to-blue-500/20'
  },
  {
    icon: Target,
    title: 'Purchase Orders',
    description: 'Create, track, and manage purchase orders with automatic stock updates.',
    size: 'wide',
    glow: 'from-violet-500/20 to-fuchsia-500/20'
  },
]

const howItWorksSteps = [
  { step: '01', title: 'Create Account', desc: 'Sign up with your email. No credit card required for the 30-day trial.', icon: Sparkles },
  { step: '02', title: 'Add Products', desc: 'Import your products or add them one by one with barcode support.', icon: Package },
  { step: '03', title: 'Start Tracking', desc: 'Get instant alerts, track stock levels, and manage your inventory smarter.', icon: Bell },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for personal use',
    features: ['1 team member', '10 products', '1 location', 'Basic tracking', 'Email support'],
    cta: 'Get Started Free',
  },
  {
    name: 'Starter',
    price: '$9',
    description: 'Great for small businesses',
    features: ['3 team members', '100 products', '5 locations', 'Priority email support'],
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: '$29',
    description: 'For growing businesses',
    features: ['10 team members', '1000 products', '20 locations', 'Stock transfers', 'Priority support'],
    cta: 'Start Free Trial',
    popular: true,
  },
]

const techStack = [
  { name: 'Next.js', icon: Code2, color: 'text-white' },
  { name: 'React', icon: Globe, color: 'text-cyan-400' },
  { name: 'Stripe', icon: Lock, color: 'text-purple-400' },
  { name: 'Supabase', icon: Database, color: 'text-green-400' },
  { name: 'TypeScript', icon: Cpu, color: 'text-blue-400' },
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

export default function HomePage() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92])
  const y = useSpring(useTransform(scrollYProgress, [0, 0.5], [0, 80]), {
    stiffness: 50,
    damping: 20,
  })

  const [activeStep, setActiveStep] = useState(0)

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
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all group-hover:scale-110">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">StockAlert</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/60 hover:text-white transition-colors cursor-pointer font-medium">Features</a>
              <Link href="/pricing" className="text-white/60 hover:text-white transition-colors cursor-pointer font-medium">Pricing</Link>
              <a href="#how-it-works" className="text-white/60 hover:text-white transition-colors cursor-pointer font-medium">How It Works</a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/auth" className="text-white/70 hover:text-white font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
                Sign In
              </Link>
              <Link href="/auth" className="bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-violet-600 hover:to-fuchsia-700 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section ref={ref} className="pt-32 pb-24 px-4 relative overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl"
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
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
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
        <motion.div 
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-500/15 to-purple-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15],
            x: [0, 15, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
            times: [0, 0.5, 1],
            delay: 4,
          }}
        />
        
        <motion.div 
          className="max-w-7xl mx-auto relative"
          style={{ opacity, scale, y }}
        >
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 text-violet-300 rounded-full text-sm font-semibold mb-8"
              variants={itemVariants}
            >
              <Zap className="w-4 h-4 text-violet-400" />
              Now with 30-day free trial - No credit card required
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">Inventory Intelligence.</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent relative inline-block">
                Zero Stress.
                <motion.div 
                  className="absolute -inset-2 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 blur-2xl -z-10"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                    times: [0, 0.5, 1],
                  }}
                />
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Track stock levels, manage suppliers, and never run out of inventory. 
              Free for small teams, powerful features for growing businesses.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={itemVariants}
            >
              <Link href="/auth" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-800 transition-all shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg text-white border-2 border-white/10 hover:border-white/20 hover:bg-white/5 backdrop-blur-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                See How It Works
              </a>
            </motion.div>
            
            <motion.p 
              className="mt-6 text-sm text-white/50 flex items-center justify-center gap-2"
              variants={itemVariants}
            >
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
              Free 30-day trial • No credit card required • Cancel anytime
              </motion.p>
          </motion.div>
        </motion.div>

        <motion.div 
          className="max-w-7xl mx-auto relative mt-24"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.4, 
            duration: 1,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
          <motion.div 
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden mx-4 lg:mx-0 lg:max-w-5xl lg:mx-auto transform hover:scale-[1.01] hover:border-white/20 transition-all duration-500 shadow-2xl"
            style={{
              perspective: '1000px',
            }}
            animate={{
              rotateX: [0, 1, 0],
              y: [0, -8, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
              times: [0, 0.5, 1],
            }}
          >
              <div className="bg-white/5 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {stats.map((stat, i) => {
                    const IconComponent = stat.Icon
                    const gradientClass = 'w-10 h-10 rounded-lg bg-gradient-to-br ' + stat.color + ' flex items-center justify-center mb-3 shadow-lg'
                    return (
                      <motion.div 
                        key={i} 
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: 0.5 + i * 0.12,
                          duration: 0.8,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                      >
                        <div className={gradientClass}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                          <span className="text-xs text-green-400 font-medium">{stat.change}</span>
                        </div>
                        <p className="text-sm text-white/60">{stat.label}</p>
                      </motion.div>
                    )
                  })}
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Low Stock Alerts</h3>
                    <span className="text-sm text-violet-400 font-medium cursor-pointer hover:text-violet-300">View All</span>
                  </div>
                  {alerts.map((item, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-lg px-2 -mx-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: 0.7 + i * 0.1,
                        duration: 0.7,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                          <Package className="w-5 h-5 text-white/60" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-sm text-white/60">{item.stock} / {item.reorder} units</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.status === 'critical' ? 'Critical' : 'Low Stock'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
      </section>

      <section className="py-12 border-y border-white/5 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-white/60 mb-6 font-medium text-sm">Trusted by modern operations teams</p>
          <Marquee items={techStack} />
        </div>
      </section>

      <section id="features" className="py-16 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-violet-400 font-semibold text-sm uppercase tracking-wider mb-3 block">Features</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Everything You Need</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              Powerful features to track, manage, and optimize your inventory across all locations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const IconComponent = feature.icon
              const sizeClass = feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : feature.size === 'wide' ? 'md:col-span-2' : ''
              return (
                <motion.div
                  key={i}
                  className={`bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-violet-500/50 transition-all duration-500 group relative overflow-hidden ${sizeClass}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    delay: i * 0.08,
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br ${feature.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} 
                  />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 blur-2xl" />
                  <div className="relative p-8">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20 group-hover:scale-110 group-hover:shadow-violet-500/40 transition-all duration-300`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-violet-400 font-semibold text-sm uppercase tracking-wider mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Get Started in Minutes</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Start tracking your inventory in 3 simple steps.
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorksSteps.map((item, i) => {
                const IconComponent = item.icon
                return (
                  <motion.div
                    key={i}
                    className="relative group cursor-pointer"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      delay: i * 0.12,
                      duration: 0.8,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    onMouseEnter={() => setActiveStep(i)}
                  >
                    <motion.div 
                      className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 border ${activeStep === i ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/10 hover:border-white/20'} transition-all duration-300 relative overflow-hidden`}
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                      {activeStep === i && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-violet-500/30 shadow-xl shadow-violet-500/10 mx-auto md:mx-0">
                          <IconComponent className="w-8 h-8 text-violet-400" />
                        </div>
                        <span className="text-6xl font-bold text-white/10 absolute top-4 right-6">{item.step}</span>
                        <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                        <p className="text-white/60 leading-relaxed">{item.desc}</p>
                        {i < 2 && (
                          <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 bg-slate-950 border border-violet-500/30 rounded-full flex items-center justify-center transform -translate-y-1/2 z-10">
                            <ArrowRight className="w-4 h-4 text-violet-400" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-violet-400 font-semibold text-sm uppercase tracking-wider mb-3 block">Pricing</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Simple, Transparent Pricing</span>
            </h2>
            <p className="text-xl text-white/60">Start free, upgrade when you're ready.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, i) => {
              return (
                <motion.div
                  key={i}
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
                    <div className={`w-14 h-14 rounded-2xl ${plan.popular ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600' : 'bg-gradient-to-br from-white/10 to-white/5'} flex items-center justify-center mb-6 ${plan.popular ? 'shadow-lg shadow-violet-500/20' : ''}`}>
                      <span className={`text-white font-bold text-xl`}>{plan.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-white/60 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
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
                  <Link href="/auth" className={`block w-full py-3.5 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${plan.popular 
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white hover:from-violet-600 hover:to-fuchsia-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40' 
                    : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'}`}>
                    {plan.cta}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="bg-gradient-to-br from-violet-600/90 to-fuchsia-600/90 backdrop-blur-xl rounded-3xl p-12 relative overflow-hidden border border-white/10 shadow-2xl"
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
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join modern operations teams using StockAlert to manage their inventory.
              </p>
              <Link href="/auth" className="inline-flex items-center gap-2 bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer">
                Start Free Trial
                <ChevronRight className="w-5 h-5" />
              </Link>
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
                No credit card required • 30-day free trial • Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-slate-950/50 backdrop-blur-sm border-t border-white/5 text-white/60 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all">
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
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm">© {new Date().getFullYear()} StockAlert. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
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
