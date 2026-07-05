'use client'

import Link from 'next/link'
import { useAllOrders } from '@/services'
import { getAdminOrderDetailHref, ROUTES, BRAND } from '@/constants'
import { formatCurrency } from '@/utils'
import { OrderStatusBadge } from '@/components/order'
import { StatsRowSkeleton } from '@/components/ui'

export default function AdminOverviewView() {
  const { orders, loading } = useAllOrders()

  const today = new Date().toDateString()
  const todaysOrders = orders.filter(o => new Date(o.created_at).toDateString() === today)
  const revenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0)
  const pendingCount = orders.filter(o => o.status === 'pending').length

  const stats = [
    { label: 'Total Orders', value: orders.length },
    { label: "Today's Orders", value: todaysOrders.length },
    { label: 'Revenue', value: formatCurrency(revenue) },
    { label: 'Pending', value: pendingCount },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">Dashboard</h1>
      <p className="mt-1 text-sm text-text-muted">Overview of {BRAND.name} orders.</p>

      <div className="mt-6">
        {loading ? (
          <StatsRowSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map(stat => (
              <div key={stat.label} className="stat-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-off-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/6 bg-card-dark/60">
        <div className="border-b border-white/6 px-5 py-4">
          <h2 className="text-sm font-semibold text-off-white">Recent Orders</h2>
        </div>
        {loading ? (
          <div className="p-5 text-sm text-text-grey">Loading…</div>
        ) : orders.length === 0 ? (
          <p className="p-10 text-center text-sm text-text-grey">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-white/6">
            {orders.slice(0, 8).map(order => (
              <li key={order.id}>
                <Link
                  href={getAdminOrderDetailHref(order.id)}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-white/3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-off-white">{order.order_number}</p>
                    <p className="text-xs text-text-grey">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-bold text-primary">{formatCurrency(order.total_amount)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-xs text-text-grey">
        Need to manage orders?{' '}
        <Link href={ROUTES.adminOrders} className="font-semibold text-primary hover:underline">
          Go to Orders →
        </Link>
      </p>
    </div>
  )
}
