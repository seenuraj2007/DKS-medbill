import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { WhatsAppSettings } from '@/components/WhatsAppSettings'
import { TallyImporter } from '@/components/TallyImporter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, MessageSquare, FileSpreadsheet, Building2, Bell, Shield } from 'lucide-react'

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
          <TabsList className="bg-slate-900 border border-slate-800 p-1 flex flex-wrap gap-1">
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
                <p className="text-slate-400">
                  Organization settings will be available here. You can manage your business name,
                  address, GST number, and other details.
                </p>
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
                <p className="text-slate-400">
                  Email and push notification settings will be available here.
                  Configure your alert preferences for low stock, out of stock,
                  and other important events.
                </p>
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

        {/* Security Notice */}
        <div className="mt-8 p-6 bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 rounded-xl border border-violet-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Security First</h3>
              <p className="text-slate-400 mt-1">
                Your data is securely stored in India and protected with enterprise-grade encryption. 
                All integrations use secure API connections with OAuth 2.0 authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
