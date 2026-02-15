'use client'

import Link from 'next/link'
import { Package, ArrowLeft, Code2, Database, Server, Zap, Lock, Shield, CheckCircle, Copy, Terminal } from 'lucide-react'
import { useState } from 'react'

const endpoints = [
  {
    method: 'GET',
    path: '/api/products',
    description: 'Retrieve all products',
    code: `curl -X GET https://api.stockalert.com/api/products \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  },
  {
    method: 'POST',
    path: '/api/products',
    description: 'Create a new product',
    code: `curl -X POST https://api.stockalert.com/api/products \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Product Name",
    "sku": "SKU-001",
    "quantity": 100
  }'`,
  },
  {
    method: 'GET',
    path: '/api/products/:id',
    description: 'Get a specific product',
    code: `curl -X GET https://api.stockalert.com/api/products/123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  },
]

export default function APIDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

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
              Get API Key
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

          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100/50">
                <Code2 className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">API Documentation</h1>
                <p className="text-gray-500 mt-1">Build powerful integrations with DKS StockAlert</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                <nav className="space-y-2">
                  <a href="#getting-started" className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                    Getting Started
                  </a>
                  <a href="#authentication" className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                    Authentication
                  </a>
                  <a href="#endpoints" className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                    Endpoints
                  </a>
                  <a href="#rates" className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                    Rate Limits
                  </a>
                </nav>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <section id="getting-started" className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Getting Started</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  The DKS StockAlert API allows you to programmatically access and manage your inventory data. Build custom integrations, automate workflows, and sync data with your existing systems.
                </p>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100/50">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold text-indigo-600">Base URL:</span> https://api.stockalert.com
                  </p>
                </div>
              </section>

              <section id="authentication" className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Authentication</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  All API requests require authentication using an API key in the Authorization header.
                </p>
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-sm">
                    <code className="text-green-400 text-xs">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </pre>
                </div>
              </section>

              <section id="endpoints" className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <Server className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">API Endpoints</h2>
                </div>
                <div className="space-y-4">
                  {endpoints.map((endpoint, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-gray-700 font-mono text-sm">{endpoint.path}</code>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 text-sm mb-3">{endpoint.description}</p>
                        <div className="relative">
                          <button
                            onClick={() => handleCopy(endpoint.code)}
                            className="absolute right-2 top-2 text-gray-500 hover:text-gray-600"
                          >
                            {copiedCode === endpoint.code ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                          </button>
                          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                            <pre className="text-sm">
                              <code className="text-gray-300 text-xs whitespace-pre">
                                {endpoint.code}
                              </code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="rates" className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Rate Limits</h2>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100/50">
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span><strong>Free Plan:</strong> 1,000 requests per day</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span><strong>Starter Plan:</strong> 10,000 requests per day</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span><strong>Professional Plan:</strong> 100,000 requests per day</span>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
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
