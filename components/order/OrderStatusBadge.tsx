import { cn } from '@/lib'
import { ORDER_STATUS_BADGE_CLASS, ORDER_STATUS_LABEL } from '@/constants'
import type { OrderStatusType } from '@/types'

export default function OrderStatusBadge({ status }: { status: OrderStatusType }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        ORDER_STATUS_BADGE_CLASS[status],
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  )
}
