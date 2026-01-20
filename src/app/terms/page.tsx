import Link from 'next/link'
import { Package, ArrowLeft, FileText, CheckCircle, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service - StockAlert',
  description: 'Terms of Service for StockAlert inventory management platform.',
}

export default function TermsPage() {
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

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/50 p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100/50">
                <FileText className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
                <p className="text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-600">1</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Acceptance of Terms</h2>
                </div>
                <p className="text-gray-600 ml-13 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100/50">
                  By accessing or using StockAlert&apos;s services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">2</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Description of Service</h2>
                </div>
                <p className="text-gray-600 ml-13">
                  StockAlert provides a cloud-based inventory management platform. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time with reasonable notice.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600">3</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">User Accounts</h2>
                </div>
                <div className="ml-13 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100/50">
                  <p className="text-gray-600">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-600">4</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Subscription and Payments</h2>
                </div>
                <div className="ml-13 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100/50">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                    <p className="text-gray-600">
                      Some features require a paid subscription. By subscribing, you agree to pay all fees associated with your chosen plan. Subscriptions renew automatically unless cancelled at least 30 days before the end of the current period.
                    </p>
                  </div>
                  <div className="flex items-start gap-4 mt-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                    <p className="text-gray-600">
                      We offer a 30-day free trial for new users. No credit card is required to start the trial. At the end of the trial, you will be charged according to your selected plan unless you cancel before the trial ends.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-red-600">5</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Acceptable Use</h2>
                </div>
                <p className="text-gray-600 ml-13 mb-4">You agree not to:</p>
                <div className="ml-13 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Use our services for any illegal or unauthorized purpose',
                    'Interfere with or disrupt our services or servers',
                    'Attempt to gain unauthorized access to any systems',
                    'Transmit viruses, malware, or other harmful code',
                    'Reverse engineer or decompile our software',
                    'Copy or distribute our services without permission'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-600">6</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Limitation of Liability</h2>
                </div>
                <div className="ml-13 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100/50">
                  <p className="text-gray-600">
                    StockAlert shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">7</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Contact Information</h2>
                </div>
                <div className="ml-13 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <p className="text-gray-600 mb-4">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-indigo-600">Email:</span>
                      legal@stockalert.com
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-indigo-600">Address:</span>
                      [Your Company Address]
                    </div>
                  </div>
                </div>
              </section>
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
