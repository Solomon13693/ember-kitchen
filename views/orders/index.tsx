'use client'

import Link from 'next/link'
import { useAuth, useMyOrders } from '@/services'
import { getOrderDetailHref, ROUTES } from '@/constants'
import { formatCurrency } from '@/utils'
import { OrderStatusBadge } from '@/components/order'
import { OrdersListSkeleton, EmptyState } from '@/components/ui'

const OrdersView = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { orders, loading } = useMyOrders(user?.id)

  if (!authLoading && !isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view your orders"
        action={{ label: 'Go to Login', href: ROUTES.login }}
      />
    )
  }

  return (
    <div className="container page-section">
      <h1 className="font-display text-3xl font-bold text-off-white">My Orders</h1>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/6 bg-card-dark/60">
        {loading || authLoading ? (
          <OrdersListSkeleton />
        ) : orders.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-text-grey">You haven&apos;t placed any orders yet.</p>
            <Link href={ROUTES.menu} className="mt-3 inline-block text-sm font-semibold text-primary">
              Browse the menu →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {orders.map(order => (
              <Link
                key={order.id}
                href={getOrderDetailHref(order.id)}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-off-white">{order.order_number}</p>
                  <p className="mt-0.5 text-xs text-text-grey">
                    {new Date(order.created_at).toLocaleString()} · {order.order_items?.length ?? 0} item(s)
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-primary">{formatCurrency(order.total_amount)}</p>
                <OrderStatusBadge status={order.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersView
