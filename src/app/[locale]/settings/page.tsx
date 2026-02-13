import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { WhatsAppSettings } from '@/components/WhatsAppSettings'
import { TallyImporter } from '@/components/TallyImporter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, MessageSquare, FileSpreadsheet, Building2, Bell, Shield, MapPin, Phone, FileText, Info, CheckCircle2, Zap, Settings2 } from 'lucide-react'
import Link from 'next/link'
import SidebarLayout from '@/components/SidebarLayout'

export const metadata: Metadata = {
  title: 'Settings - DKS StockAlert',
  description: 'Manage your account, notifications, and integrations',
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

  const params = await props.params
  const locale = params.locale

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-500">
            Manage your account, notifications, and integrations
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 flex flex-wrap gap-1 w-full rounded-xl shadow-sm">
            <TabsTrigger value="general" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">
              <Building2 className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Import
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <div className="grid gap-6">
              {/* Quick Actions Card */}
              <Card className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg shadow-gray-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Building2 className="w-5 h-5 text-indigo-500" />
                    Organization Settings
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Manage your organization details for GST invoices and business operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/${locale}/settings/organization`}
                    className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Manage Organization
                  </Link>
                </CardContent>
              </Card>

              {/* Business Information Card */}
              <Card className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg shadow-gray-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <MapPin className="w-5 h-5 text-indigo-500" />
                    Business Information
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Configure your business details for invoices and communications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Business Address</p>
                        <p className="text-xs text-gray-500">Set your business location</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">GST Number</p>
                        <p className="text-xs text-gray-500">Add GSTIN for tax compliance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Contact Info</p>
                        <p className="text-xs text-gray-500">Phone and email for invoices</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings Overview */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              {/* WhatsApp Notifications */}
              <Card className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg shadow-gray-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    WhatsApp Alerts
                    <span className="ml-auto text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Free 1,000/mo</span>
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Instant notifications on your phone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                    <div className="grid gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">1,000 messages/month FREE</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        Bilingual messages (English + Hindi)
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Bell className="w-4 h-4 text-indigo-500" />
                        Instant alerts on your phone
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                    <p>Configure WhatsApp in the <span className="text-green-600 font-medium">WhatsApp</span> tab. First 1,000 messages are free, then ~₹0.50-₹3.00 per message.</p>
                  </div>
                </CardContent>
              </Card>

              {/* In-App Notifications */}
              <Card className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg shadow-gray-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Bell className="w-5 h-5 text-blue-500" />
                    In-App Notifications
                    <span className="ml-auto text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">ALWAYS FREE</span>
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Real-time alerts in the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-green-600">ALWAYS FREE:</span> Real-time dashboard alerts with no limits
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* WhatsApp Settings */}
          <TabsContent value="whatsapp">
            <Card className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg shadow-gray-200/50">
              <CardContent className="pt-6">
                <WhatsAppSettings />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Settings */}
          <TabsContent value="import">
            <Card className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg shadow-gray-200/50">
              <CardContent className="pt-6">
                <TallyImporter />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Why Choose DKS StockAlert */}
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Why DKS StockAlert?</h3>
              <p className="text-gray-500 mt-1 mb-4">
                We are the only inventory software in India with these killer features:
              </p>
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700"><span className="text-green-600 font-semibold">WhatsApp Alerts</span> - Get instant low stock alerts on your phone (1,000 FREE/mo)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700"><span className="text-purple-600 font-semibold">1-Click Tally Import</span> - Migrate from Tally in seconds, not hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-gray-700"><span className="text-orange-600 font-semibold">Complete Hindi Support</span> - Manage your business in हिंदी</span>
                </div>
              </div>
              <p className="text-gray-500 mt-4 text-sm">
                Your data is securely stored in India with enterprise-grade encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
