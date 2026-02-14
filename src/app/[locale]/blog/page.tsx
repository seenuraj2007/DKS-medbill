import Link from 'next/link'
import { Package, ArrowLeft, FileText, Calendar, User, Clock } from 'lucide-react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inventory Management Blog - Tips, Guides & Industry News | DKS StockAlert',
  description: 'Read the latest inventory management tips, GST compliance guides, small business advice, and industry news on the DKS StockAlert blog. Learn how to optimize your stock management.',
  keywords: ['inventory management blog', 'stock management tips', 'GST compliance guide', 'small business inventory', 'warehouse management tips', 'inventory software tutorials'],
  openGraph: {
    title: 'DKS StockAlert Blog - Inventory Management Insights',
    description: 'Expert tips and guides on inventory management, GST compliance, and small business operations.',
    type: 'website',
  },
}

const blogPosts = [
  {
    id: 1,
    title: '5 Inventory Mistakes That Cost Businesses Money',
    excerpt: 'Learn about common inventory management pitfalls and how to avoid them to save your business money and improve efficiency.',
    author: 'DKS StockAlert Team',
    date: 'January 15, 2025',
    category: 'Tips & Tricks',
    readTime: '5 min read',
  },
  {
    id: 2,
    title: 'Getting Started with DKS StockAlert: A Complete Guide',
    excerpt: 'Everything you need to know to set up and use StockAlert effectively for your business inventory management needs.',
    author: 'DKS StockAlert Team',
    date: 'January 10, 2025',
    category: 'Tutorial',
    readTime: '8 min read',
  },
  {
    id: 3,
    title: 'Why Small Businesses Need Inventory Management Software',
    excerpt: 'Discover how inventory management software can help small businesses grow, save time, and reduce costs.',
    author: 'DKS StockAlert Team',
    date: 'January 5, 2025',
    category: 'Business',
    readTime: '6 min read',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockAlert</span>
            </Link>
            <Link href="/auth" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Insights, tips, and updates on inventory management and business efficiency
            </p>
          </div>

          <div className="space-y-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-gray-600">{post.author}</span>
                    </div>
                    <span className="text-indigo-600 font-medium hover:text-indigo-700 cursor-pointer">
                      Read more →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Stay Updated</h3>
              <p className="text-gray-600 mb-6">
                Subscribe to our newsletter for the latest inventory management tips and updates.
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white"
                />
                <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} StockAlert. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
