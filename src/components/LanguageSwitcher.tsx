'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'

const locales = ['en', 'hi'] as const
type Locale = typeof locales[number]

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const [currentLocale, setCurrentLocale] = useState<Locale>('en')

  const handleChange = (newLocale: string) => {
    // Remove current locale from pathname
    const pathnameWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/'
    
    // Navigate to new locale
    router.push(`/${newLocale}${pathnameWithoutLocale}`)
    router.refresh()
    setCurrentLocale(newLocale as Locale)
  }

  const languageNames: Record<Locale, string> = {
    en: 'English',
    hi: 'हिंदी',
  }

  return (
    <div className="relative inline-flex items-center">
      <Globe className="w-4 h-4 absolute left-3 text-gray-500" />
      <select
        value={currentLocale}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none cursor-pointer"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {languageNames[loc]}
          </option>
        ))}
      </select>
      <div className="absolute right-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
