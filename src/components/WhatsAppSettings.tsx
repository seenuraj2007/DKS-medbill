'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Phone, Bell, Send, Check, AlertCircle } from 'lucide-react'

// Translation strings (hardcoded for now)
const t = (key: string) => {
  const strings: Record<string, string> = {
    'whatsapp.title': 'WhatsApp Settings',
    'whatsapp.description': 'Get alerts directly on WhatsApp to your phone',
    'whatsapp.enableWhatsApp': 'Enable WhatsApp Alerts',
    'whatsapp.phoneNumber': 'WhatsApp Phone Number',
    'whatsapp.phonePlaceholder': '+91 98765 43210',
    'whatsapp.notificationTypes': 'Notification Types',
    'whatsapp.lowStock': 'Low Stock Alerts',
    'whatsapp.outOfStock': 'Out of Stock Alerts',
    'whatsapp.purchaseOrders': 'Purchase Order Updates',
    'whatsapp.dailySummary': 'Daily Summary',
    'whatsapp.language': 'Message Language',
    'whatsapp.english': 'English',
    'whatsapp.hindi': 'Hindi',
    'whatsapp.testMessage': 'Send Test Message',
    'whatsapp.testSent': 'Test message sent!',
    'whatsapp.setupRequired': 'WhatsApp Business API setup required. Please contact admin.',
  }
  return strings[key] || key
}

interface WhatsAppSettings {
  enabled: boolean
  phoneNumber: string
  notifications: {
    lowStock: boolean
    outOfStock: boolean
    purchaseOrders: boolean
    dailySummary: boolean
  }
  language: 'en' | 'hi'
}

export function WhatsAppSettings() {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    enabled: false,
    phoneNumber: '',
    notifications: {
      lowStock: true,
      outOfStock: true,
      purchaseOrders: true,
      dailySummary: false,
    },
    language: 'en',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings/whatsapp')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      setMessage(null)

      const response = await fetch('/api/settings/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setIsSaving(false)
    }
  }

  const sendTestMessage = async () => {
    try {
      setMessage(null)
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: settings.phoneNumber,
          type: 'welcome',
          message: { businessName: 'Your Business' },
          language: settings.language,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: t('testSent') })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to send test message' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test message' })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
            <p className="text-gray-400 mt-1">{t('description')}</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Enable WhatsApp */}
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div>
              <label className="text-white font-medium">{t('enableWhatsApp')}</label>
              <p className="text-sm text-gray-400 mt-1">Receive inventory alerts on WhatsApp</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.enabled && (
            <>
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  {t('phoneNumber')}
                </label>
                <input
                  type="tel"
                  value={settings.phoneNumber}
                  onChange={(e) => setSettings(s => ({ ...s, phoneNumber: e.target.value }))}
                  placeholder={t('phonePlaceholder')}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Notification Types */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Bell className="w-4 h-4 inline mr-2" />
                  {t('notificationTypes')}
                </label>
                <div className="space-y-3">
                  {[
                    { key: 'lowStock', label: t('lowStock') },
                    { key: 'outOfStock', label: t('outOfStock') },
                    { key: 'purchaseOrders', label: t('purchaseOrders') },
                    { key: 'dailySummary', label: t('dailySummary') },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications[key as keyof typeof settings.notifications]}
                        onChange={(e) => setSettings(s => ({
                          ...s,
                          notifications: { ...s.notifications, [key]: e.target.checked }
                        }))}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-violet-500 focus:ring-violet-500"
                      />
                      <span className="text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('language')}
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(s => ({ ...s, language: e.target.value as 'en' | 'hi' }))}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="en">{t('english')}</option>
                  <option value="hi">{t('hindi')}</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>

          {settings.enabled && settings.phoneNumber && (
            <button
              onClick={sendTestMessage}
              className="px-6 py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {t('testMessage')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
