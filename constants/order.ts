import type { OrderStatusType } from '@/types'

export const ORDER_STATUS_LABEL: Record<OrderStatusType, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatusType, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-blue/10 text-blue',
  preparing: 'bg-primary/10 text-primary',
  ready: 'bg-success/10 text-success',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
}

export const ORDER_STATUS_FILTERS: Array<{ key: OrderStatusType | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]
