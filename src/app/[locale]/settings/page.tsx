import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { WhatsAppSettings } from '@/components/WhatsAppSettings'
import { TallyImporter } from '@/components/TallyImporter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, MessageSquare, FileSpreadsheet, Building2, Bell, Shield, MapPin, Phone, FileText, Info, CheckCircle2, Zap, Settings2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import SidebarLayout from '@/components/SidebarLayout'

export const metadata: Metadata = {
  title: 'Settings - DKS StockAlert',
  description: 'Manage your account, notifications, and integrations',
}

interface SettingItem {
  href: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  badge?: string
}

type SettingGroup = {
  title: string
  items: SettingItem[]
}

const settingGroups: SettingGroup[] = [
  {
    title: 'Organization',
    items: [
      { 
        href: '/settings/organization', 
        label: 'Organization Details', 
        description: 'Manage GST, address, and business info',
        icon: Building2, 
        color: 'text-indigo-600', 
        bgColor: 'bg-indigo-50' 
      },
      { 
        href: '/settings/organization', 
        label: 'Business Address', 
        description: 'Set your business location',
        icon: MapPin, 
        color: 'text-green-600', 
        bgColor: 'bg-green-50' 
      },
      { 
        href: '/settings/organization', 
        label: 'Contact Information', 
        description: 'Phone and email for invoices',
        icon: Phone, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
    ]
  },
  {
    title: 'Notifications',
    items: [
      { 
        href: '#whatsapp', 
        label: 'WhatsApp Alerts', 
        description: 'Instant notifications on your phone',
        icon: MessageSquare, 
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        badge: '1,000 FREE/mo'
      },
      { 
        href: '#notifications', 
        label: 'In-App Notifications', 
        description: 'Real-time alerts in the app',
        icon: Bell, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50',
        badge: 'Always Free'
      },
    ]
  },
  {
    title: 'Integrations',
    items: [
      { 
        href: '#whatsapp', 
        label: 'WhatsApp Setup', 
        description: 'Configure WhatsApp messaging',
        icon: MessageSquare, 
        color: 'text-green-600', 
        bgColor: 'bg-green-50' 
      },
      { 
        href: '#import', 
        label: 'Tally Import', 
        description: 'Import data from Tally',
        icon: FileSpreadsheet, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50' 
      },
    ]
  }
]

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
      <div className="sm:max-w-7xl mx-auto pb-20 sm:pb-0">
        {/* Mobile App Header */}
        <div className="sm:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <div className="w-8" />
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:block mb-8">
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

        {/* Mobile Content - App Style List */}
        <div className="sm:hidden mt-16 space-y-6">
          {settingGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                {group.title}
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {group.items.map((item, index) => {
                  const Icon = item.icon
                  const href = item.href.startsWith('#') 
                    ? `/${locale}/settings${item.href}` 
                    : `/${locale}${item.href}`
                  
                  return (
                    <Link
                      key={`${group.title}-${item.label}`}
                      href={href}
                      className={`flex items-center gap-4 px-4 py-4 ${
                        index !== group.items.length - 1 ? 'border-b border-gray-50' : ''
                      } active:bg-gray-50 transition-colors`}
                    >
                      <div className={`w-11 h-11 ${item.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{item.label}</p>
                          {item.badge && (
                            <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Language Section */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
              Language
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <LanguageSwitcher />
            </div>
          </div>

          {/* App Info */}
          <div className="text-center pt-4 pb-8">
            <p className="text-xs text-gray-400">DKS StockAlert v1.0.0</p>
            <p className="text-[10px] text-gray-300 mt-1">Your data is securely encrypted</p>
          </div>
        </div>

        {/* Desktop Content - Tabs Layout */}
        <div className="hidden sm:block">
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

                <Card className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg shadow-gray-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Globe className="w-5 h-5 text-indigo-500" />
                      Language
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Choose your preferred language
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LanguageSwitcher />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="space-y-6">
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
                          Instant messaging
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

            <TabsContent value="whatsapp">
              <Card className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg shadow-gray-200/50">
                <CardContent className="pt-6">
                  <WhatsAppSettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import">
              <Card className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg shadow-gray-200/50">
                <CardContent className="pt-6">
                  <TallyImporter />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Why DKS StockAlert?</h3>
                <p className="text-gray-500 mt-1 mb-4">
                  We have these killer features:
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
                    <span className="text-gray-700"><span className="text-orange-600 font-semibold">Multi-language Support</span> - Reach a broader audience</span>
                  </div>
                </div>
                <p className="text-gray-500 mt-4 text-sm">
                  Your data is securely stored with enterprise-grade encryption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
