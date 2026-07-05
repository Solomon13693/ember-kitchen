'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useOrderTracking, updateOrderStatus } from '@/services'
import { useToast } from '@/hooks'
import { ROUTES, ORDER_STATUS_LABEL, getAdminCustomerDetailHref } from '@/constants'
import { formatCurrency } from '@/utils'
import { OrderStatusBadge, OrderTimeline, OrderItemAddonsList } from '@/components/order'
import { Skeleton, SkeletonLine } from '@/components/ui'
import type { OrderStatusType } from '@/types'

const STATUS_OPTIONS: OrderStatusType[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

export default function AdminOrderDetailView() {
  const { id } = useParams<{ id: string }>()
  const { order, loading, refresh, statusHistory } = useOrderTracking(id)
  const { showSuccess, showError } = useToast()
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (status: OrderStatusType) => {
    if (!order || status === order.status) return
    setUpdating(true)
    try {
      await updateOrderStatus(order.id, status)
      await refresh()
      showSuccess('Order status updated')
    } catch (error) {
      showError('Update failed', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLine height="h-8" width="w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold text-off-white">Order not found</p>
        <Link href={ROUTES.adminOrders} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeftIcon className="size-4" />
          Back to orders
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        href={ROUTES.adminOrders}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-grey transition-colors hover:text-off-white"
      >
        <ArrowLeftIcon className="size-4" />
        Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">Order {order.order_number}</h1>
          <p className="mt-1 text-sm text-text-grey">Placed {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">Status</p>
          <div className="mt-2">
            <select
              value={order.status}
              disabled={updating}
              onChange={e => handleStatusChange(e.target.value as OrderStatusType)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-off-white"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {ORDER_STATUS_LABEL[option]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">Total</p>
          <p className="mt-2 text-lg font-bold text-primary">{formatCurrency(order.total_amount)}</p>
        </div>

        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">Fulfillment</p>
          <p className="mt-2 text-sm font-semibold capitalize text-off-white">{order.type}</p>
        </div>

        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">Phone</p>
          <p className="mt-2 text-sm font-semibold text-off-white">{order.phone}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-5">
          <h2 className="mb-3 text-sm font-semibold text-off-white">Items</h2>
          <div className="space-y-3">
            {order.order_items?.map(orderItem => {
              const addons = orderItem.addons ?? []
              const itemName = orderItem.menu_items?.name ?? 'Item'

              return (
                <div key={orderItem.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between text-sm text-text-muted">
                    <span className="font-medium text-off-white">
                      {orderItem.quantity} × {itemName}
                    </span>
                    <span className="shrink-0 text-off-white">
                      {formatCurrency(orderItem.price * orderItem.quantity)}
                    </span>
                  </div>
                  <OrderItemAddonsList addons={addons} compact variant="chips" />
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-5 text-sm text-text-muted">
          <h2 className="mb-3 text-sm font-semibold text-off-white">Customer details</h2>
          {order.profiles ? (
            <>
              <p>
                <span className="font-semibold text-off-white">Name:</span>{' '}
                <Link
                  href={getAdminCustomerDetailHref(order.profiles.id)}
                  className="font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {order.profiles.name}
                </Link>
              </p>
              <p className="mt-1">
                <span className="font-semibold text-off-white">Profile phone:</span>{' '}
                {order.profiles.phone ?? '—'}
              </p>
            </>
          ) : (
            <p className="text-text-grey">Customer profile unavailable.</p>
          )}
          <p className="mt-1">
            <span className="font-semibold text-off-white">Order phone:</span> {order.phone}
          </p>
          {order.address && (
            <p className="mt-1">
              <span className="font-semibold text-off-white">Address:</span> {order.address}
            </p>
          )}
          {order.notes && (
            <p className="mt-1">
              <span className="font-semibold text-off-white">Notes:</span> {order.notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/6 bg-card-dark/60 p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-off-white">Order Timeline</h2>
          <span className="text-xs text-text-grey">Updates live</span>
        </div>
        <OrderTimeline
          status={order.status}
          statusHistory={statusHistory}
        />
      </div>
    </div>
  )
}
