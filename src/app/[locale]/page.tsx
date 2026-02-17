'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useState } from 'react'
import {
  Package, TrendingDown, AlertTriangle, Bell, Users, MapPin,
  Truck, BarChart3, Shield, Zap, ArrowRight, CheckCircle,
  ChevronRight, Layers, Target, Sparkles, Cpu, Lock,
  Database, Code2, Globe, Server, Receipt, QrCode, FileText,
  IndianRupee, Building2, UserPlus, MessageSquare, Smartphone,
  Download, Languages, Star, TrendingUp, Check, Clock, Github, Heart
} from 'lucide-react'

const stats = [
  { label: 'Products Tracked', value: '156', change: '+12 this week', color: 'from-blue-500 to-blue-600', Icon: Package },
  { label: 'Low Stock Items', value: '8', change: 'Action needed', color: 'from-yellow-500 to-orange-500', Icon: TrendingDown },
  { label: 'Out of Stock', value: '2', change: 'Restock ASAP', color: 'from-red-500 to-red-600', Icon: AlertTriangle },
  { label: 'Stock Value (₹)', value: '₹2.4L', change: '+₹45K', color: 'from-green-500 to-green-600', Icon: IndianRupee },
]

const alerts = [
  { name: 'Aashirvaad Atta (5kg)', stock: 4, reorder: 20, status: 'critical' },
  { name: 'Patanjali Honey (500g)', stock: 6, reorder: 50, status: 'warning' },
  { name: 'MDH Masala (100g)', stock: 15, reorder: 100, status: 'warning' },
]

const features = [
  {
    icon: Github,
    title: 'Open Source',
    description: 'Transparent, secure, and community-driven. Fork on GitHub, contribute, or host your own instance. No vendor lock-in.',
    size: 'wide',
    glow: 'from-green-500/20 to-emerald-500/20',
    badge: 'FREE FOREVER'
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Alerts',
    description: 'Coming Soon: Get instant low stock alerts on WhatsApp. Stay tuned for this feature!',
    size: 'wide',
    glow: 'from-green-500/20 to-emerald-500/20',
    badge: 'COMING SOON'
  },
  {
    icon: Download,
    title: '1-Click Tally Import',
    description: 'Migrate from Tally in seconds, not hours. Import products, stock levels, and GST details with one click.',
    size: 'wide',
    glow: 'from-blue-500/20 to-cyan-500/20',
    badge: 'GAME CHANGER'
  },
  {
    icon: Package,
    title: 'Real-time Stock Tracking',
    description: 'Track inventory levels across multiple warehouses and retail locations in real-time. Know exactly what you have, where you have it.',
    size: 'small',
    glow: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: Languages,
    title: 'Multi-Language Ready',
    description: 'Built with internationalization support. Easily add new languages as your business grows globally.',
    size: 'small',
    glow: 'from-orange-500/20 to-red-500/20',
    badge: 'I18N READY'
  },
  {
    icon: Receipt,
    title: 'GST-Ready Invoicing',
    description: 'Generate GST-compliant invoices automatically with HSN codes, tax breakdowns, and e-way bill integration.',
    size: 'small',
    glow: 'from-green-500/20 to-emerald-500/20'
  },
  {
    icon: MapPin,
    title: 'Multi-Location Management',
    description: 'Manage stock across multiple godowns, shops, and warehouses from a single dashboard.',
    size: 'small',
    glow: 'from-orange-500/20 to-red-500/20'
  },
  {
    icon: QrCode,
    title: 'Barcode Generation',
    description: 'Generate and print barcodes for any product. Scan to quickly update stock or process sales.',
    size: 'small',
    glow: 'from-indigo-500/20 to-violet-500/20'
  },
  {
    icon: FileText,
    title: 'Purchase Orders',
    description: 'Create and manage purchase orders with suppliers. Track pending deliveries and auto-update stock on receipt.',
    size: 'small',
    glow: 'from-violet-500/20 to-fuchsia-500/20'
  },
]

const competitorFeatures = [
  { name: 'DKS StockAlert', price: '₹0', whatsapp: 'coming', tally: true, free: true },
  { name: 'Zoho Inventory', price: '₹749/mo', whatsapp: false, tally: false, free: false },
  { name: 'Marg ERP', price: '₹18,000', whatsapp: false, tally: false, free: false },
  { name: 'Tally', price: '₹54,000', whatsapp: false, tally: false, free: false },
]

const howItWorksSteps = [
  { step: '01', title: 'Import from Tally or Start Fresh', desc: 'Migrate your existing Tally data in 1 click, or add products manually with barcode support. Set reorder levels and GST rates.', icon: Download },
  { step: '02', title: 'Setup Alerts', desc: 'Configure in-app notifications to get instant alerts for low stock and out-of-stock items.', icon: Bell },
  { step: '03', title: 'Track & Manage Inventory', desc: 'Track stock levels, generate GST invoices, and manage inventory effortlessly from a single dashboard.', icon: Languages },
]

const techStack = [
  { name: 'Next.js 16', icon: Code2, color: 'text-white' },
  { name: 'React 19', icon: Globe, color: 'text-cyan-400' },
  { name: 'Prisma ORM', icon: Database, color: 'text-indigo-400' },
  { name: 'Neon PostgreSQL', icon: Server, color: 'text-green-400' },
  { name: 'TypeScript', icon: Cpu, color: 'text-blue-400' },
  { name: 'Tailwind CSS', icon: Sparkles, color: 'text-teal-400' },
  { name: 'Framer Motion', icon: Zap, color: 'text-pink-400' },
  { name: 'WhatsApp API', icon: MessageSquare, color: 'text-green-400' },
]

function Marquee({ items }: { items: typeof techStack }) {
  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex gap-8"
        animate={{
          x: [0, -2500],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 35,
            ease: "linear",
          },
        }}
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-violet-500/30 transition-colors"
          >
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <span className="text-white/80 font-medium whitespace-nowrap">{item.name}</span>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

      {/* Beta Banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">
        <span className="font-bold">🚀 OPEN SOURCE:</span>
        <span className="hidden sm:inline"> This project is open source —</span>
        <a href="https://github.com/seenuraj2007/stockalert" target="_blank" rel="noopener noreferrer" className="underline font-medium ml-1 hover:text-white whitespace-nowrap">Star on GitHub →</a>
      </div>

      <nav className="fixed top-8 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-white/10 px-4 sm:px-6 mt-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all group-hover:scale-110">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent leading-tight">DKS StockAlert</span>
                <span className="text-[10px] text-emerald-400 font-medium hidden sm:block">Free & Open Source</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#features" className="text-white/60 hover:text-white transition-colors cursor-pointer font-medium text-sm">Features</a>
              <a href="#comparison" className="text-white/60 hover:text-white transition-colors cursor-pointer font-medium text-sm">Why Us</a>
              <a href="#pricing" className="text-white/60 hover:text-white transition-colors cursor-pointer font-medium text-sm">Pricing</a>
              <a href="#how-it-works" className="text-white/60 hover:text-white transition-colors cursor-pointer font-medium text-sm">How It Works</a>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/auth" className="hidden md:block text-white/70 hover:text-white font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer text-sm">
                Sign In
              </Link>
              <Link 
                href="/auth" 
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 text-xs sm:text-sm whitespace-nowrap border border-white/20"
              >
                Get Started
              </Link>
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-xl bg-white hover:bg-white/90 transition-all border border-white/30 flex items-center justify-center shadow-lg"
                aria-label="Toggle menu"
              >
                <div className="w-5 h-4 flex flex-col justify-between items-center py-0.5">
                  <span 
                    className={`w-5 h-0.5 bg-slate-950 rounded-full transition-all duration-300 origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}
                  />
                  <span 
                    className={`w-5 h-0.5 bg-slate-950 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-0' : ''}`}
                  />
                  <span 
                    className={`w-5 h-0.5 bg-slate-950 rounded-full transition-all duration-300 origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
            style={{ top: '80px' }}
          />
        )}

        {/* Mobile Menu */}
        <motion.div 
          initial={false}
          animate={{ 
            opacity: mobileMenuOpen ? 1 : 0,
            y: mobileMenuOpen ? 0 : -20,
            pointerEvents: mobileMenuOpen ? 'auto' : 'none'
          }}
          className="md:hidden absolute top-full left-4 right-4 mt-2 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
        >
          <div className="p-2">
            {[
              { href: '#features', label: 'Features', icon: Package },
              { href: '#comparison', label: 'Why Us', icon: Star },
              { href: '#pricing', label: 'Pricing', icon: IndianRupee },
              { href: '#how-it-works', label: 'How It Works', icon: Clock },
            ].map((item) => (
              <a 
                key={item.href}
                href={item.href} 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-all rounded-xl font-medium"
              >
                <item.icon className="w-5 h-5 text-violet-400" />
                {item.label}
              </a>
            ))}
            <div className="border-t border-white/10 mt-2 pt-2 px-4 pb-2">
              <Link 
                href="/auth" 
                className="flex items-center gap-2 text-white/70 hover:text-white py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Already have an account?</span>
                <span className="text-violet-400 font-medium">Sign In</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </nav>

      <section ref={ref} className="pt-40 pb-24 px-4 relative overflow-hidden">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 text-green-300 rounded-full text-sm font-semibold mb-8"
              variants={itemVariants}
            >
              <Github className="w-4 h-4" />
              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">OPEN SOURCE</span>
              Free & transparent — Contribute on GitHub
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight px-2 sm:px-0"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">Inventory Management</span>
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent relative inline-block mt-2 sm:mt-0">
                Built for Modern Businesses.
              </span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-xl text-white/60 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
              variants={itemVariants}
            >
              The only <span className="text-green-400 font-semibold">open source</span> inventory software with
              <span className="text-amber-400 font-semibold"> WhatsApp alerts</span>,
              <span className="text-blue-400 font-semibold"> 1-click Tally import</span>, and
              <span className="text-green-400 font-semibold"> in-app notifications</span>.
              <span className="hidden sm:inline"> Built by the community, free tier limited.</span>
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={itemVariants}
            >
              <Link href="/auth" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-800 transition-all shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg text-white border-2 border-white/10 hover:border-white/20 hover:bg-white/5 backdrop-blur-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                See Features
              </a>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2">
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
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-violet-400" />
                GST Compliant
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400" />
                WhatsApp Alerts
              </div>
            </motion.div>
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
              <div className="flex-1 text-center text-xs text-white/40 font-mono">DKS StockAlert Dashboard</div>
            </div>
            <div className="p-3 sm:p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                {stats.map((stat, i) => {
                  const IconComponent = stat.Icon
                  const gradientClass = 'w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ' + stat.color + ' flex items-center justify-center mb-2 sm:mb-3 shadow-lg'
                  return (
                    <motion.div
                      key={i}
                      className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/20 transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.5 + i * 0.12,
                        duration: 0.8,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    >
                      <div className={gradientClass}>
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-lg sm:text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <p className="text-xs sm:text-sm text-white/60">{stat.label}</p>
                      <span className="text-[10px] sm:text-xs text-green-400 font-medium mt-1 block truncate">{stat.change}</span>
                    </motion.div>
                  )
                })}
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    Low Stock Alerts
                  </h3>
                  <span className="text-xs sm:text-sm text-violet-400 font-medium cursor-pointer hover:text-violet-300">View All</span>
                </div>
                {alerts.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between py-2 sm:py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-lg px-2 -mx-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.7 + i * 0.1,
                      duration: 0.7,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm sm:text-base truncate">{item.name}</p>
                        <p className="text-xs sm:text-sm text-white/60">{item.stock} left (reorder: {item.reorder})</p>
                      </div>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0 ${item.status === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                      {item.status === 'critical' ? 'Critical' : 'Low'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* NEW: Competitive Advantages Banner */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-gray-500/30 transition-all opacity-80">
              <div className="w-16 h-16 bg-gray-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">WhatsApp Alerts</h3>
              <p className="text-white/60 mb-3">Coming Soon: Get instant low stock and out-of-stock alerts directly on your phone via WhatsApp.</p>
              <div className="text-xs text-slate-400 mb-3">Stay tuned for updates</div>
              <div className="mt-2 inline-flex items-center gap-1 text-gray-500 text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>COMING SOON</span>
              </div>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1-Click Tally Import</h3>
              <p className="text-white/60">Migrate from Tally in seconds, not hours. Import products, stock, and GST details instantly.</p>
              <div className="mt-4 inline-flex items-center gap-1 text-blue-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>GAME CHANGER</span>
              </div>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-green-500/30 transition-all">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">In-App Alerts</h3>
              <p className="text-white/60">Get instant notifications for low stock, out of stock, and purchase order updates directly in the dashboard.</p>
              <div className="mt-4 inline-flex items-center gap-1 text-green-400 text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>FREE FOREVER</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 border-y border-white/5 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-white/60 mb-6 font-medium text-sm">Built with modern, secure technologies</p>
          <Marquee items={techStack} />
        </div>
      </section>

      <section id="features" className="py-24 px-4 relative">
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
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Everything You Need to Manage Inventory</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              Stop juggling Excel sheets. Get real-time visibility into your stock across all locations with powerful features designed for your business.
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
                    {feature.badge && (
                      <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white text-xs font-bold rounded-full">
                        {feature.badge}
                      </span>
                    )}
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

      {/* NEW: Competitor Comparison Section */}
      <section id="comparison" className="py-24 px-4 relative bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-violet-400 font-semibold text-sm uppercase tracking-wider mb-3 block">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">See Why We're Better</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              Compare us with the competition. We're the only truly free option with Tally import, multi-location support, and in-app notifications.
            </p>
          </motion.div>

          <motion.div
            className="overflow-x-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-6 text-white font-semibold">Features</th>
                  <th className="py-4 px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-4 py-2 rounded-lg font-bold">
                      DKS StockAlert
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center text-white/60">Zoho Inventory</th>
                  <th className="py-4 px-6 text-center text-white/60">Marg ERP</th>
                  <th className="py-4 px-6 text-center text-white/60">Tally</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-4 px-6 text-white font-medium">Price</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-green-400 font-bold text-xl">₹0</span>
                    <span className="text-white/60 text-sm block">Limited Time</span>
                  </td>
                  <td className="py-4 px-6 text-center text-white/60">₹749/mo</td>
                  <td className="py-4 px-6 text-center text-white/60">₹18,000</td>
                  <td className="py-4 px-6 text-center text-white/60">₹54,000</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-medium">WhatsApp Alerts</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 text-sm font-medium">Coming Soon</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-red-400">✗</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-red-400">✗</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-red-400">✗</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-medium">Tally Import</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-green-400 font-medium">1-Click</span>
                  </td>
                  <td className="py-4 px-6 text-center text-white/60">Manual</td>
                  <td className="py-4 px-6 text-center text-white/60">—</td>
                  <td className="py-4 px-6 text-center text-white/60">—</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-medium">Free Trial</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-green-400 font-medium">Free</span>
                  </td>
                  <td className="py-4 px-6 text-center text-white/60">14 days</td>
                  <td className="py-4 px-6 text-center text-white/60">—</td>
                  <td className="py-4 px-6 text-center text-white/60">—</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-medium">GST Ready</td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-6 h-6 text-green-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-6 h-6 text-green-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-6 h-6 text-green-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-6 h-6 text-green-400 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-4 relative bg-slate-900/30">
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
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Setup in 5 Minutes</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Get started immediately. No complex implementation, no training required.
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
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-green-400 font-semibold text-sm uppercase tracking-wider mb-3 block">Open Source</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Free Now. Limited Features.</span>
            </h2>
            <p className="text-xl text-white/60">Open source means no vendor lock-in. Pay for hosting, not for software.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 backdrop-blur-xl rounded-3xl p-8 border border-violet-500/50 relative overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <motion.div
                className="absolute top-4 right-4 px-4 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-violet-500/50"
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
                Popular
              </motion.div>

              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Open Source Plan</h3>
                <p className="text-white/60 mb-4">Free tier — Limited features, no vendor lock-in</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">₹0</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <span className="text-white/80">Up to 50 products</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <span className="text-white/80">5 locations/godowns</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <span className="text-white/80">3 team members</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <span className="text-white/80">GST invoicing</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <span className="text-white/80 font-semibold text-blue-400">📊 Tally import</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <span className="text-white/80">Email support</span>
                </li>
              </ul>

              <Link href="/auth" className="block w-full py-4 px-6 text-center font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white hover:from-violet-600 hover:to-fuchsia-700 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40">
                Get Started Free
              </Link>
              <p className="text-center text-white/50 text-sm mt-3">Open source — No credit card required</p>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                delay: 0.1,
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-6 border border-white/10">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-white/60 mb-4">For large businesses with custom needs</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">Custom</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span className="text-white/80">Unlimited products</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span className="text-white/80">Unlimited locations</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span className="text-white/80">Unlimited team members</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span className="text-white/80">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span className="text-white/80">Custom integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span className="text-white/80">Dedicated account manager</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-6 px-8 py-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Shield className="w-5 h-5 text-green-400" />
                <span>ISO 27001 Certified</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Database className="w-5 h-5 text-violet-400" />
                <span>Secure cloud storage</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Lock className="w-5 h-5 text-blue-400" />
                <span>256-bit Encryption</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 relative bg-slate-900/30">
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
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Stop Using Excel?</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses managing their inventory smarter with DKS StockAlert.
              </p>
              <Link href="/auth" className="inline-flex items-center gap-2 bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer">
                Get Free Access Now
                <ChevronRight className="w-5 h-5" />
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>No vendor lock-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Setup in 5 minutes</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-slate-950/50 backdrop-blur-sm border-t border-white/5 text-white/60 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">DKS StockAlert</span>
              </Link>
              <p className="text-sm leading-relaxed mb-4 max-w-sm">
                Open source inventory management software built for businesses. Track stock, generate invoices, and manage multiple locations with ease.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <a href="https://github.com/seenuraj2007/stockalert" target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full hover:bg-green-500/30 transition-colors flex items-center gap-1">
                  <Github className="w-3 h-3" />
                  Star on GitHub
                </a>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Tally Import</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Made with care</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a></li>
                <li><a href="#comparison" className="hover:text-white transition-colors cursor-pointer">Why Us</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors cursor-pointer">Pricing</a></li>
                <li><Link href="/auth" className="hover:text-white transition-colors cursor-pointer">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Community</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://github.com/seenuraj2007/stockalert" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</a></li>
                <li><Link href="/about" className="hover:text-white transition-colors cursor-pointer">About</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-white/50">
              <p>© {new Date().getFullYear()} DKS StockAlert. Open source — MIT License.</p>
              <div className="hidden md:block w-1 h-1 bg-white/30 rounded-full" />
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-green-600 text-white text-xs font-bold rounded">OPEN SOURCE</span>
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  ISO 27001
                </span>
                <span className="flex items-center gap-1">
                  <Receipt className="w-3 h-3 text-blue-400" />
                  GST Ready
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
