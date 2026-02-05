import Link from 'next/link'
import { Package, ArrowLeft, Shield, Eye, Lock, Globe } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy - DKS StockAlert',
  description: 'Privacy Policy for DKS StockAlert inventory management platform.',
}

export default function PrivacyPage() {
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
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100/50">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-600">1</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Introduction</h2>
                </div>
                <p className="text-gray-600 ml-13">
                  At DKS StockAlert, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our inventory management platform. By using DKS StockAlert, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">2</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Information We Collect</h2>
                </div>
                
                <div className="ml-13 space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                    </div>
                    <p className="text-gray-600">
                      When you create an account, we collect personal information including your name, email address, and company name. You may also provide profile information such as a profile photo.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-medium text-gray-900">Organization Data</h3>
                    </div>
                    <p className="text-gray-600 mb-3">
                      We collect and store information you add to our platform, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>Product information (names, descriptions, quantities, prices)</li>
                      <li>Supplier and vendor information</li>
                      <li>Location and warehouse data</li>
                      <li>Team member information and roles</li>
                      <li>Inventory transactions and history</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600">3</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">How We Use Your Information</h2>
                </div>
                <div className="ml-13 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100/50">
                  <p className="text-gray-600 mb-4">We use the collected information for the following purposes:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      Providing and maintaining our inventory management services
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      Processing transactions and sending related information
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      Sending promotional communications (you may opt-out at any time)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      Responding to your comments, questions, and requests
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      Monitoring and analyzing trends, usage, and activities
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      Detecting, investigating, and preventing fraudulent transactions
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-600">4</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Data Security</h2>
                </div>
                <div className="ml-13 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100/50">
                  <div className="flex items-start gap-4">
                    <Lock className="w-8 h-8 text-orange-600 mt-1" />
                    <div>
                      <p className="text-gray-600 mb-3">
                        We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit and at rest, regular security assessments, and access controls.
                      </p>
                      <p className="text-gray-500 text-sm">
                        While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-600">5</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Your Rights</h2>
                </div>
                <div className="ml-13">
                  <p className="text-gray-600 mb-4">You have the following rights regarding your personal information:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <span className="text-indigo-500 font-semibold">Access:</span>
                      <span className="text-gray-600 ml-2">Request a copy of your personal data</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <span className="text-indigo-500 font-semibold">Correction:</span>
                      <span className="text-gray-600 ml-2">Request correction of inaccurate data</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <span className="text-indigo-500 font-semibold">Deletion:</span>
                      <span className="text-gray-600 ml-2">Request deletion of your personal data</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <span className="text-indigo-500 font-semibold">Export:</span>
                      <span className="text-gray-600 ml-2">Request a machine-readable export</span>
                    </div>
                  </div>
                </div>
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
                    If you have questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-indigo-600">Email:</span>
                      privacy@stockalert.com
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
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} DKS StockAlert. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
