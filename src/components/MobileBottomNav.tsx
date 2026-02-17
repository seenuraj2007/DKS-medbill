'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useMemo } from 'react'
import {
    LayoutDashboard, Package, Calculator, FileText, MoreHorizontal,
    Menu
} from 'lucide-react'

interface MobileBottomNavProps {
    onMenuClick: () => void
    locale: string
}

const navItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/billing', label: 'POS', icon: Calculator },
    { href: '/invoices', label: 'Invoices', icon: FileText },
]

const MobileBottomNav = memo(function MobileBottomNav({ onMenuClick, locale }: MobileBottomNavProps) {
    const pathname = usePathname()

    const activeTab = useMemo(() => {
        for (const item of navItems) {
            const localized = `/${locale}${item.href}`
            if (pathname === localized || pathname.startsWith(`${localized}/`)) {
                return item.href
            }
        }
        return null
    }, [pathname, locale])

    return (
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
            <div className="mobile-bottom-nav-inner">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.href
                    const href = `/${locale}${item.href}`

                    return (
                        <Link
                            key={item.href}
                            href={href}
                            prefetch={true}
                            className={`mobile-nav-item ${isActive ? 'mobile-nav-item-active' : 'mobile-nav-item-inactive'}`}
                        >
                            <div className={`mobile-nav-icon-wrap ${isActive ? 'mobile-nav-icon-active' : ''}`}>
                                <Icon className="mobile-nav-icon" strokeWidth={isActive ? 2.5 : 1.8} />
                            </div>
                            <span className="mobile-nav-label">{item.label}</span>
                        </Link>
                    )
                })}

                {/* More / Menu button */}
                <button
                    onClick={onMenuClick}
                    className="mobile-nav-item mobile-nav-item-inactive"
                    aria-label="Open menu"
                >
                    <div className="mobile-nav-icon-wrap">
                        <MoreHorizontal className="mobile-nav-icon" strokeWidth={1.8} />
                    </div>
                    <span className="mobile-nav-label">More</span>
                </button>
            </div>
        </nav>
    )
})

export default MobileBottomNav
