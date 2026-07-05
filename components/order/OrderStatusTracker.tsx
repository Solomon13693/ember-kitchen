import { CheckIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib'
import { ORDER_STATUS_LABEL } from '@/constants'
import { ORDER_STATUS_FLOW, type OrderStatusType } from '@/types'

export default function OrderStatusTracker({ status }: { status: OrderStatusType }) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
        Order cancelled
      </div>
    )
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status)

  return (
    <ol className="space-y-3">
      {ORDER_STATUS_FLOW.map((step, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex

        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                isDone && 'bg-success text-white',
                isCurrent && 'bg-primary text-white',
                !isDone && !isCurrent && 'bg-white/10 text-text-grey',
              )}
            >
              {isDone ? <CheckIcon className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                'text-sm',
                isCurrent ? 'font-semibold text-off-white' : isDone ? 'text-text-muted' : 'text-text-grey',
              )}
            >
              {ORDER_STATUS_LABEL[step]}
              {isCurrent && ' (current)'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
