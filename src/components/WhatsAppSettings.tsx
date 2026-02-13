'use client'

import { MessageSquare, Clock, Bell } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function WhatsAppSettings() {
  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">WhatsApp Alerts</CardTitle>
              <CardDescription className="text-gray-500">
                Get instant inventory alerts on your phone
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coming Soon Banner */}
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              WhatsApp alerts are currently in development. This feature will be available as part of our premium plans.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-indigo-600">
              <Bell className="w-4 h-4" />
              <span>You'll be notified when it's ready</span>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">What you'll get:</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Instant Alerts</p>
                  <p className="text-xs text-gray-500">Get notified immediately when stock runs low</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">हिं</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Bilingual Support</p>
                  <p className="text-xs text-gray-500">Messages in English and Hindi</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-amber-600">1K</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">1,000 Messages/Month</p>
                  <p className="text-xs text-gray-500">Generous free tier included</p>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> In-app notifications are always available and work great for tracking your inventory alerts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
