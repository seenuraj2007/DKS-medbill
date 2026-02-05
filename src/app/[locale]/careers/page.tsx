import Link from 'next/link'
import { Package, ArrowLeft, Briefcase, MapPin, Globe, Users, Target } from 'lucide-react'

export const metadata = {
  title: 'Careers - StockAlert',
  description: 'Join the StockAlert team and help build the future of inventory management.',
}

const openings = [
  {
    title: 'Full Stack Developer',
    department: 'Engineering',
    location: 'Bangalore, India (Remote)',
    type: 'Full-time',
    description: 'Build and maintain our web application using Next.js, React, and Supabase. You will work on features that directly impact our customers.',
    responsibilities: [
      'Develop new features and improve existing ones',
      'Write clean, maintainable, and efficient code',
      'Collaborate with design and product teams',
      'Participate in code reviews and technical discussions',
      'Debug and resolve technical issues',
    ],
    requirements: [
      '3+ years of experience with React and Next.js',
      'Strong proficiency in TypeScript',
      'Experience with Supabase or PostgreSQL',
      'Knowledge of REST APIs and modern web technologies',
      'Good problem-solving skills and attention to detail',
      'Excellent communication skills',
    ],
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Mumbai, India (Hybrid)',
    type: 'Full-time',
    description: 'Create intuitive and beautiful user experiences for our inventory management platform. You will shape the product from concept to implementation.',
    responsibilities: [
      'Design user interfaces and experiences',
      'Create wireframes, prototypes, and high-fidelity mockups',
      'Conduct user research and usability testing',
      'Collaborate with developers to implement designs',
      'Maintain and improve our design system',
    ],
    requirements: [
      '2+ years of product design experience',
      'Proficiency in Figma or similar tools',
      'Strong portfolio demonstrating UX/UI skills',
      'Understanding of design principles and best practices',
      'Experience with mobile and responsive design',
      'Excellent communication and collaboration skills',
    ],
  },
]

export default function CareersPage() {
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
              Join Us
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
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We&apos;re looking for talented individuals who are passionate about building great products and helping businesses succeed.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100/50 text-center">
                <Target className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Our Mission</h3>
                <p className="text-gray-600 text-sm">
                  Help businesses of all sizes manage inventory efficiently with simple, powerful tools.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100/50 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Our Culture</h3>
                <p className="text-gray-600 text-sm">
                  Collaborative, inclusive, and focused on continuous learning and growth.
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100/50 text-center">
                <Globe className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Our Benefits</h3>
                <p className="text-gray-600 text-sm">
                  Competitive salary, remote work, health insurance, and learning opportunities.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Open Positions</h2>

              <div className="space-y-6">
                {openings.map((job) => (
                  <div
                    key={job.title}
                    className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="px-2 py-1 bg-white rounded-full border border-gray-200">
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap">
                        Apply Now
                      </button>
                    </div>
                    <p className="text-gray-600 mb-6">{job.description}</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Responsibilities</h4>
                        <ul className="space-y-2">
                          {job.responsibilities.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                        <ul className="space-y-2">
                          {job.requirements.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-2">Don&apos;t see a role that fits?</h3>
                <p className="text-white/80 mb-4">
                  We&apos;re always looking for talented people. Send us your resume and tell us how you can contribute.
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-md"
                >
                  Contact Us
                </Link>
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
