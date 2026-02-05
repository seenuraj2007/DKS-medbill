import Link from 'next/link'
import { Package, ArrowLeft, Building2, Users, Target, Heart, Globe, Award } from 'lucide-react'

export const metadata = {
  title: 'About Us - DKS StockAlert',
  description: 'Learn about DKS StockAlert and our mission.',
}

export default function AboutPage() {
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

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/50 p-8 md:p-12 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100/50">
                <Building2 className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">About DKS StockAlert</h1>
                <p className="text-gray-500 mt-1">Simplifying inventory management since 2024</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <p className="text-gray-600 text-lg leading-relaxed">
                  DKS StockAlert was founded with a simple mission: to make inventory management accessible and effortless for businesses of all sizes. We believe that every business, regardless of its size, deserves powerful tools to manage their stock efficiently.
                </p>
              </section>

              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-gray-600">
                  We&apos;re building inventory management software that helps businesses never run out of stock, eliminate waste, and make smarter decisions about their products. We combine powerful features with an intuitive interface that anyone can use.
                </p>
              </section>

              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Our Values</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100/50">
                    <h3 className="font-semibold text-gray-900 mb-2">Customer First</h3>
                    <p className="text-gray-600 text-sm">Your success is our success. We listen, learn, and iterate based on your feedback.</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100/50">
                    <h3 className="font-semibold text-gray-900 mb-2">Simplicity</h3>
                    <p className="text-gray-600 text-sm">Complex problems deserve simple, elegant solutions that anyone can use.</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100/50">
                    <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                    <p className="text-gray-600 text-sm">We continuously improve and introduce new features to stay ahead.</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100/50">
                    <h3 className="font-semibold text-gray-900 mb-2">Reliability</h3>
                    <p className="text-gray-600 text-sm">Trust is earned through consistent performance and security.</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Made in India</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  StockAlert is proudly built in India, with 100% of our team based here. We understand the unique challenges faced by Indian businesses and have designed our platform specifically for them.
                </p>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100/50">
                  <div className="flex items-start gap-4">
                    <Award className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Data Stored in India</h3>
                      <p className="text-gray-600 text-sm">
                        All your data is stored within India, complying with data localization requirements. We are ISO 27001 certified, ensuring the highest standards of information security.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Our Team</h2>
                </div>
                <p className="text-gray-600">
                  We&apos;re a small but growing team passionate about building great software. Our diverse backgrounds in technology, design, and business help us create products that truly serve our customers&apos; needs.
                </p>
              </section>
            </div>
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
