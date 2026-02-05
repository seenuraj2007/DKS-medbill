import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { WhatsAppSettings } from '@/components/WhatsAppSettings'
import { TallyImporter } from '@/components/TallyImporter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, MessageSquare, FileSpreadsheet, Building2, Bell, Shield, MapPin, Phone, Mail, FileText } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Settings - DKS StockAlert',
  description: 'Manage your account and application settings',
}

export default async function SettingsPage(props: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies()
  const mockRequest = new Request('http://localhost', {
    headers: {
      cookie: cookieStore.toString(),
    },
  })
  const session = await getCurrentUser(mockRequest)
  
  if (!session) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-slate-400 mt-2">
            Manage your account, notifications, and integrations
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 flex flex-wrap gap-1 w-full">
            <TabsTrigger value="general" className="data-[state=active]:bg-violet-600">
              <Building2 className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="language" className="data-[state=active]:bg-violet-600">
              <Globe className="w-4 h-4 mr-2" />
              Language
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-violet-600">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-violet-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-violet-600">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Import
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-violet-400" />
                  Organization Settings
                </CardTitle>
                <CardDescription>
                  Manage your business information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-400 mb-4">
                    Configure your organization details for GST invoices and business operations.
                  </p>
                  <Link 
                    href="/settings/organization"
                    className="inline-flex items-center justify-center w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition-colors"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Manage Organization
                  </Link>
                  <div className="grid gap-3 mt-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-violet-400" />
                      <div>
                        <p className="text-sm text-slate-300">Business Address</p>
                        <p className="text-xs text-slate-500">Set your business location</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <FileText className="w-5 h-5 text-violet-400" />
                      <div>
                        <p className="text-sm text-slate-300">GST Number</p>
                        <p className="text-xs text-slate-500">Add GSTIN for tax compliance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <Phone className="w-5 h-5 text-violet-400" />
                      <div>
                        <p className="text-sm text-slate-300">Contact Info</p>
                        <p className="text-xs text-slate-500">Phone and email for invoices</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Settings */}
          <TabsContent value="language">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-violet-400" />
                  Language Settings
                </CardTitle>
                <CardDescription>
                  Choose your preferred language for the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Interface Language
                    </label>
                    <LanguageSwitcher />
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">
                      Currently supported languages:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        English (Default)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        हिंदी (Hindi)
                      </li>
                    </ul>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Switch between English and Hindi throughout the application interface.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-violet-400" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Bell className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-300">Low Stock Alerts</p>
                          <p className="text-xs text-slate-500">Get notified when stock is low</p>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-violet-600 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <Bell className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-300">Out of Stock Alerts</p>
                          <p className="text-xs text-slate-500">Critical alerts for stockouts</p>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-violet-600 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-300">Purchase Order Updates</p>
                          <p className="text-xs text-slate-500">Track your PO status</p>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-violet-600 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-300">Daily Stock Summary</p>
                          <p className="text-xs text-slate-500">End of day report</p>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-slate-600 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-300">WhatsApp Notifications</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Configure WhatsApp alerts separately in the <span className="text-green-400">WhatsApp</span> tab.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Settings */}
          <TabsContent value="whatsapp">
            <WhatsAppSettings />
          </TabsContent>

          {/* Import Settings */}
          <TabsContent value="import">
            <TallyImporter />
          </TabsContent>
        </Tabs>

        {/* Why Choose DKS StockAlert */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-900/20 to-violet-900/20 rounded-xl border border-green-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Why DKS StockAlert?</h3>
              <p className="text-slate-400 mt-1 mb-4">
                We're the only inventory software in India with these killer features:
              </p>
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-slate-300"><span className="text-green-400 font-semibold">WhatsApp Alerts</span> - Get instant low stock alerts on your phone</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-slate-300"><span className="text-blue-400 font-semibold">1-Click Tally Import</span> - Migrate from Tally in seconds, not hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-slate-300"><span className="text-orange-400 font-semibold">Complete Hindi Support</span> - Manage your business in हिंदी</span>
                </div>
              </div>
              <p className="text-slate-400 mt-4 text-sm">
                Your data is securely stored in India with enterprise-grade encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
