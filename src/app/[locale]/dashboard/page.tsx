'use client'

import { useEffect, useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { Package, TrendingDown, AlertTriangle, Bell, Plus, ArrowUpRight, ArrowDownRight, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionGate } from '@/components/SubscriptionGate'
import SidebarLayout from '@/components/SidebarLayout'

interface DashboardStats {
    totalProducts: number
    lowStockProducts: number
    outOfStockProducts: number
    unreadAlerts: number
    lowStockItems: Array<{ id: string; name: string; current_quantity: number; reorder_point: number }>
    subscription?: {
        status: string
        plan?: {
            name: string
            display_name: string
            max_team_members: number
            max_products: number
            max_locations: number
        }
        trial_end_date?: string
    }
    usage?: {
        teamMembers: number
        products: number
        locations: number
    }
}

interface StatCardProps {
    title: string
    value: number | string
    icon: React.ComponentType<{ className?: string }>
    color: string
    trend?: number
}

const StatCard = memo(({ title, value, icon: Icon, color, trend }: StatCardProps) => (
    <div className="card-elevated p-3.5 sm:p-5 tap-bounce">
        <div className="flex items-center justify-between mb-2.5">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-[1.1rem] h-[1.1rem] sm:w-5 sm:h-5 text-white" />
            </div>
            {trend !== undefined && trend > 0 && (
                <span className="text-[0.6875rem] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">
                    <ArrowUpRight className="w-3 h-3" />
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-[1.375rem] sm:text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
        <p className="text-[0.75rem] text-gray-700 mt-0.5 font-semibold">{title}</p>
    </div>
))

StatCard.displayName = 'StatCard'

interface LowStockItemProps {
    item: {
        id: string
        name: string
        current_quantity: number
        reorder_point: number
    }
    onClick: () => void
}

const LowStockItem = memo(({ item, onClick }: LowStockItemProps) => {
    const percentage = item.reorder_point > 0
        ? Math.min(100, (item.current_quantity / item.reorder_point) * 100)
        : item.current_quantity > 0 ? 100 : 0

    return (
        <div
            className="native-list-item"
            onClick={onClick}
        >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.current_quantity === 0 ? 'bg-red-50' : 'bg-amber-50'
                }`}>
                <Package className={`w-[1.1rem] h-[1.1rem] ${item.current_quantity === 0 ? 'text-red-500' : 'text-amber-500'
                    }`} />
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-[0.8125rem] truncate leading-tight">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${item.current_quantity === 0 ? 'bg-red-500' : 'bg-amber-500'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <span className="text-[0.6875rem] text-gray-500 font-medium flex-shrink-0">
                        {item.current_quantity}/{item.reorder_point}
                    </span>
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
        </div>
    )
})

LowStockItem.displayName = 'LowStockItem'

export default function DashboardPage() {
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboard()
    }, [])

    const fetchDashboard = async () => {
        try {
            const res = await fetch('/api/dashboard/stats', {
                credentials: 'include',
                next: { revalidate: 30 }
            })
            if (res.status === 401) {
                router.push('/auth')
                return
            }
            const data = await res.json()
            setStats(data)
        } catch (error) {
            console.error('Error fetching dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <SidebarLayout>
                <div className="max-w-7xl mx-auto">
                    {/* Skeleton loading */}
                    <div className="mb-5">
                        <div className="skeleton h-7 w-32 mb-2" />
                        <div className="skeleton h-4 w-48" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="card-elevated p-4">
                                <div className="skeleton w-9 h-9 rounded-xl mb-3" />
                                <div className="skeleton h-6 w-16 mb-2" />
                                <div className="skeleton h-3 w-24" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="card-elevated p-4">
                            <div className="skeleton h-5 w-32 mb-4" />
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 mb-3">
                                    <div className="skeleton w-9 h-9 rounded-xl" />
                                    <div className="flex-1">
                                        <div className="skeleton h-3.5 w-24 mb-1.5" />
                                        <div className="skeleton h-1.5 w-full rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="skeleton h-64 rounded-2xl" />
                    </div>
                </div>
            </SidebarLayout>
        )
    }

    return (
        <SidebarLayout>
            <SubscriptionGate>
                <div className="max-w-7xl mx-auto">
                    {/* Trial Banner */}
                    {stats?.subscription?.status === 'trial' && stats.subscription.trial_end_date && (
                        <div className="card-elevated bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-4 py-3 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <span className="text-[0.8125rem] font-semibold">
                                    {Math.ceil((new Date(stats.subscription.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                                </span>
                            </div>
                            <Link href="/subscription" className="text-[0.8125rem] font-semibold flex items-center gap-0.5 cursor-pointer">
                                Upgrade <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}

                    {/* Page Title */}
                    <div className="mb-5 sm:mb-7">
                        <h1 className="text-[1.5rem] sm:text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                        <p className="text-gray-500 mt-0.5 text-[0.8125rem] sm:text-base">Overview of your inventory</p>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-7">
                        <StatCard
                            title="Total Products"
                            value={stats?.totalProducts || 0}
                            icon={Package}
                            color="bg-gradient-to-br from-blue-500 to-blue-600"
                        />
                        <StatCard
                            title="Low Stock"
                            value={stats?.lowStockProducts || 0}
                            icon={TrendingDown}
                            color="bg-gradient-to-br from-amber-500 to-orange-500"
                            trend={stats?.lowStockProducts || 0}
                        />
                        <StatCard
                            title="Out of Stock"
                            value={stats?.outOfStockProducts || 0}
                            icon={AlertTriangle}
                            color="bg-gradient-to-br from-red-500 to-red-600"
                        />
                        <StatCard
                            title="Unread Alerts"
                            value={stats?.unreadAlerts || 0}
                            icon={Bell}
                            color="bg-gradient-to-br from-indigo-500 to-purple-600"
                        />
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                        {/* Low Stock Items */}
                        <div className="card-elevated-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
                                <h2 className="text-[0.9375rem] sm:text-lg font-bold text-gray-900">Low Stock Items</h2>
                                <Link
                                    href="/products"
                                    className="text-indigo-600 text-[0.75rem] sm:text-sm font-semibold flex items-center gap-0.5 cursor-pointer"
                                >
                                    View All
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {stats?.lowStockItems?.length === 0 ? (
                                <div className="text-center py-10 px-4">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <Package className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium text-[0.875rem]">No low stock items</p>
                                    <p className="text-[0.75rem] text-gray-400 mt-0.5">All products are well stocked!</p>
                                </div>
                            ) : (
                                <div className="native-list-group mx-0 rounded-none border-x-0 border-b-0">
                                    {stats?.lowStockItems?.map((item) => (
                                        <LowStockItem
                                            key={item.id}
                                            item={item}
                                            onClick={() => router.push(`/products/${item.id}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="card-elevated-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #4338ca 100%)' }}>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                            <div className="p-4 sm:p-5 relative">
                                <h2 className="text-[0.9375rem] sm:text-lg font-bold mb-4 text-white drop-shadow-sm">Quick Actions</h2>
                                <div className="space-y-2.5">
                                    <Link
                                        href="/products/new"
                                        className="block bg-white/20 backdrop-blur-sm rounded-xl p-3.5 hover:bg-white/30 transition-all border border-white/20 cursor-pointer tap-bounce"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-white/30 rounded-lg flex items-center justify-center shadow-sm">
                                                <Plus className="w-[1.1rem] h-[1.1rem] text-white" />
                                            </div>
                                            <span className="font-semibold text-[0.875rem] text-white">Add New Product</span>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/products"
                                        className="block bg-white/20 backdrop-blur-sm rounded-xl p-3.5 hover:bg-white/30 transition-all border border-white/20 cursor-pointer tap-bounce"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-white/30 rounded-lg flex items-center justify-center shadow-sm">
                                                <Package className="w-[1.1rem] h-[1.1rem] text-white" />
                                            </div>
                                            <span className="font-semibold text-[0.875rem] text-white">View All Products</span>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/alerts"
                                        className="block bg-white/20 backdrop-blur-sm rounded-xl p-3.5 hover:bg-white/30 transition-all border border-white/20 cursor-pointer tap-bounce"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-white/30 rounded-lg flex items-center justify-center shadow-sm">
                                                <Bell className="w-[1.1rem] h-[1.1rem] text-white" />
                                            </div>
                                            <span className="font-semibold text-[0.875rem] text-white">Check Alerts</span>
                                        </div>
                                    </Link>
                                </div>

                                <div className="mt-4 p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                                    <p className="text-[0.75rem] text-white">
                                        <span className="font-semibold text-white">💡 Tip:</span> Set reorder points to get alerts when stock runs low.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SubscriptionGate>
        </SidebarLayout>
    )
}
