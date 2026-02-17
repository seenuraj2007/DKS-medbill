'use client'

import { useEffect, useCallback, memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, TrendingUp, Package, MapPin, Truck,
    FileText, ArrowUpDown, Bell, Users, Settings, User,
    Calculator, Receipt, X, LogOut, ChevronRight, Sparkles,
    CreditCard, BarChart2, Store, Boxes
} from 'lucide-react'

interface MobileMoreMenuProps {
    isOpen: boolean
    onClose: () => void
    locale: string
    onLogout: () => void
}

const menuSections = [
    {
        title: 'Overview',
        items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'View overview' },
            { href: '/analytics', label: 'Analytics', icon: BarChart2, desc: 'Reports & insights' },
            { href: '/alerts', label: 'Alerts', icon: Bell, desc: 'Notifications' },
        ]
    },
    {
        title: 'Inventory',
        items: [
            { href: '/products', label: 'Products', icon: Package, desc: 'Manage products' },
            { href: '/locations', label: 'Locations', icon: MapPin, desc: 'Stock locations' },
            { href: '/suppliers', label: 'Suppliers', icon: Truck, desc: 'Vendor management' },
            { href: '/stock-transfers', label: 'Transfers', icon: ArrowUpDown, desc: 'Move stock' },
        ]
    },
    {
        title: 'Sales & Billing',
        items: [
            { href: '/billing', label: 'POS / Billing', icon: Calculator, desc: 'Create sales' },
            { href: '/invoices', label: 'Invoices', icon: Receipt, desc: 'Manage invoices' },
            { href: '/purchase-orders', label: 'Purchase Orders', icon: FileText, desc: 'Buy stock' },
        ]
    },
    {
        title: 'Settings',
        items: [
            { href: '/team', label: 'Team Members', icon: Users, desc: 'Manage users' },
            { href: '/settings', label: 'Settings', icon: Settings, desc: 'App preferences' },
            { href: '/profile', label: 'My Profile', icon: User, desc: 'Account details' },
        ]
    },
]

const MobileMoreMenu = memo(function MobileMoreMenu({ isOpen, onClose, locale, onLogout }: MobileMoreMenuProps) {
    const pathname = usePathname()

    const handleItemClick = useCallback(() => {
        onClose()
    }, [onClose])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in sm:hidden"
                onClick={onClose}
            />
            
            {/* Bottom Sheet */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-50 rounded-t-3xl z-50 max-h-[90vh] overflow-hidden sm:hidden animate-slide-up shadow-2xl">
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-5 py-3 flex items-center justify-between bg-white border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)] pb-6">
                    {menuSections.map((section, sectionIndex) => (
                        <div key={section.title} className={sectionIndex > 0 ? 'mt-2' : ''}>
                            <div className="px-5 py-2">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {section.title}
                                </h3>
                            </div>
                            <div className="px-3">
                                {section.items.map((item, itemIndex) => {
                                    const Icon = item.icon
                                    const localizedHref = `/${locale}${item.href}`
                                    const isActive = pathname === localizedHref || pathname.startsWith(`${localizedHref}/`)

                                    return (
                                        <Link
                                            key={item.href}
                                            href={localizedHref}
                                            onClick={handleItemClick}
                                            className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${isActive 
                                                ? 'bg-white shadow-md border border-indigo-100' 
                                                : 'hover:bg-white hover:shadow-sm'
                                            }`}
                                        >
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isActive
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200'
                                                : 'bg-white shadow-sm border border-gray-100'
                                            }`}>
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold text-sm ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {item.label}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {item.desc}
                                                </p>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-500' : 'text-gray-300'}`} />
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Logout Section */}
                    <div className="mt-4 px-3">
                        <div className="px-2 py-2">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Account
                            </h3>
                        </div>
                        <button
                            onClick={() => {
                                onClose()
                                onLogout()
                            }}
                            className="flex items-center gap-4 p-3 rounded-2xl w-full transition-all hover:bg-white hover:shadow-sm"
                        >
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-50 border border-red-100">
                                <LogOut className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-sm text-red-600">
                                    Logout
                                </p>
                                <p className="text-xs text-gray-400">
                                    Sign out of your account
                                </p>
                            </div>
                        </button>
                    </div>

                    {/* Version info */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-300">DKS StockAlert v1.0</p>
                    </div>
                </div>
            </div>
        </>
    )
})

MobileMoreMenu.displayName = 'MobileMoreMenu'

export default MobileMoreMenu
