'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useMemo } from 'react'
import {
    LayoutDashboard, Package, Calculator, FileText, MoreHorizontal,
    Menu, Grid3X3
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
        // Check if on More page
        if (pathname === `/${locale}/more`) {
            return '/more'
        }
        return null
    }, [pathname, locale])

    const isMoreActive = pathname === `/${locale}/more`

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

                {/* More Page Link */}
                <Link
                    href={`/${locale}/more`}
                    prefetch={true}
                    className={`mobile-nav-item ${isMoreActive ? 'mobile-nav-item-active' : 'mobile-nav-item-inactive'}`}
                    aria-label="More"
                >
                    <div className={`mobile-nav-icon-wrap ${isMoreActive ? 'mobile-nav-icon-active' : ''}`}>
                        <Grid3X3 className="mobile-nav-icon" strokeWidth={isMoreActive ? 2.5 : 1.8} />
                    </div>
                    <span className="mobile-nav-label">More</span>
                </Link>
            </div>
        </nav>
    )
})

export default MobileBottomNav
