'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useOrderTracking } from '@/services'
import { formatCurrency, getMenuItemHrefWithAddons } from '@/utils'
import { ROUTES } from '@/constants'
import { OrderTimeline, OrderStatusBadge, OrderItemAddonsList } from '@/components/order'
import { SkeletonLine, Skeleton } from '@/components/ui'

const OrderDetailView = () => {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { order, loading, statusHistory } = useOrderTracking(id)

  if (loading) {
    return (
      <div className="container page-section space-y-4">
        <SkeletonLine height="h-8" width="w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container page-section text-center">
        <p className="text-lg font-semibold text-off-white">Order not found</p>
        <button onClick={() => router.push(ROUTES.orders)} className="mt-4 text-sm font-semibold text-primary">
          ← Back to my orders
        </button>
      </div>
    )
  }

  return (
    <div className="container page-section">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">Order {order.order_number}</h1>
          <p className="mt-0.5 text-sm text-text-grey">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4 sm:p-5 lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold text-off-white">Order Timeline</h2>
          <OrderTimeline
            status={order.status}
            statusHistory={statusHistory}
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-off-white">Items</h2>
            <div className="space-y-3">
              {order.order_items?.map(orderItem => {
                const addons = orderItem.addons ?? []
                const itemName = orderItem.menu_items?.name ?? 'Item'
                const lineTotal = orderItem.price * orderItem.quantity

                return (
                  <div key={orderItem.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between text-sm text-text-muted">
                      <span>
                        {orderItem.menu_item_id ? (
                          <Link
                            href={getMenuItemHrefWithAddons(
                              orderItem.menu_item_id,
                              addons.map(addon => addon.id),
                            )}
                            className="font-medium text-off-white transition-colors hover:text-primary"
                          >
                            {orderItem.quantity} × {itemName}
                          </Link>
                        ) : (
                          <span className="font-medium text-off-white">
                            {orderItem.quantity} × {itemName}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-off-white">{formatCurrency(lineTotal)}</span>
                    </div>
                    <OrderItemAddonsList addons={addons} compact variant="chips" />
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm font-bold text-off-white">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-5 text-sm text-text-muted">
            <p>
              <span className="font-semibold text-off-white">Fulfillment:</span> {order.type}
            </p>
            {order.address && (
              <p className="mt-1">
                <span className="font-semibold text-off-white">Address:</span> {order.address}
              </p>
            )}
            <p className="mt-1">
              <span className="font-semibold text-off-white">Phone:</span> {order.phone}
            </p>
            {order.notes && (
              <p className="mt-1">
                <span className="font-semibold text-off-white">Notes:</span> {order.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailView
