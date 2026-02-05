'use client'

import Link from 'next/link'
import { Package, ArrowLeft, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 text-sm">support@stockalert.com</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600 text-sm">+91 98765 43210</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600 text-sm">Bangalore, India</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-8 md:p-12">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 hover:bg-white"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 hover:bg-white"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 hover:bg-white"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 hover:bg-white resize-none"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-xl font-bold mb-2">Looking for Support?</h3>
            <p className="text-white/80 mb-4">
              Check out our documentation and FAQs for quick answers to common questions.
            </p>
            <Link
              href="/api-docs"
              className="inline-block bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-md"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
