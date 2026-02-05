import Link from 'next/link'
import { Package, ArrowLeft, Cookie, Lock, Eye, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Cookie Policy - DKS StockAlert',
  description: 'Cookie Policy for DKS StockAlert inventory management platform.',
}

export default function CookiePolicyPage() {
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

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/50 p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-100/50">
                <Cookie className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Cookie Policy</h1>
                <p className="text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-600">1</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">What Are Cookies</h2>
                </div>
                <p className="text-gray-600 ml-13">
                  Cookies are small text files that are stored on your device when you visit a website. They help us provide you with a better experience by remembering your preferences and enabling certain functionality.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">2</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">How We Use Cookies</h2>
                </div>
                <div className="ml-13 space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-900">Essential Cookies</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-blue-500" />Authentication and session management</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-blue-500" />Security and fraud prevention</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-blue-500" />Site accessibility</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Lock className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-medium text-gray-900">Functional Cookies</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-purple-500" />Remembering your language preference</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-purple-500" />Remembering your dashboard settings</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-purple-500" />Providing custom content</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Cookie className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-medium text-gray-900">Analytics Cookies</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      These cookies help us understand how visitors interact with our website by collecting anonymous information.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Analyzing website traffic and usage patterns</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Measuring the effectiveness of our marketing</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Improving website performance</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600">3</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Managing Cookies</h2>
                </div>
                <div className="ml-13 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100/50">
                  <p className="text-gray-600 mb-4">
                    You can control and manage cookies in various ways. Please note that removing or blocking cookies may impact your user experience and parts of our website may no longer be fully accessible.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">•</span>
                      <p className="text-gray-600 text-sm">
                        <strong>Browser Settings:</strong> Most web browsers allow you to control cookies through their settings. You can usually find these options in the &quot;Preferences&quot; or &quot;Settings&quot; menu of your browser.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">•</span>
                      <p className="text-gray-600 text-sm">
                        <strong>Opt-Out:</strong> Some third-party services provide opt-out mechanisms. You can learn more about these on their respective websites.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-600">4</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Third-Party Cookies</h2>
                </div>
                <p className="text-gray-600 ml-13">
                  We use third-party services that may set cookies on your device when you use our website. These services include payment processors (Cashfree), analytics tools, and other service providers. These cookies are subject to their respective privacy policies.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-600">5</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Updates to This Policy</h2>
                </div>
                <p className="text-gray-600 ml-13">
                  We may update this Cookie Policy from time to time to reflect changes in our use of cookies, applicable laws, or other operational changes. We encourage you to review this policy periodically.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">6</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Contact Us</h2>
                </div>
                <div className="ml-13 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <p className="text-gray-600 mb-4">
                    If you have any questions about our use of cookies, please contact us:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-indigo-600">Email:</span>
                      privacy@stockalert.com
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
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
