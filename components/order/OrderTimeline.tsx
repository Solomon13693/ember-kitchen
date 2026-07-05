import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib'
import { ORDER_STATUS_LABEL } from '@/constants'
import { formatDateTime } from '@/utils'
import { ORDER_STATUS_FLOW, type OrderStatusType } from '@/types'

export type OrderStatusEvent = {
  status: OrderStatusType
  at: string
}

type TimelineStep = {
  key: string
  label: string
  at: string | null
  state: 'done' | 'current' | 'upcoming'
}

function getStepState(
  status: OrderStatusType,
  index: number,
  currentIndex: number,
): TimelineStep['state'] {
  if (status === 'cancelled') {
    return index === 0 ? 'done' : index === 1 ? 'done' : 'upcoming'
  }

  if (status === 'delivered') {
    return index <= currentIndex ? 'done' : 'upcoming'
  }

  if (index < currentIndex) return 'done'
  if (index === currentIndex) return 'current'
  return 'upcoming'
}

function buildTimelineSteps(
  status: OrderStatusType,
  statusHistory: OrderStatusEvent[],
): TimelineStep[] {
  const historyMap = new Map(statusHistory.map(event => [event.status, event.at]))

  if (status === 'cancelled') {
    return [
      {
        key: 'pending',
        label: ORDER_STATUS_LABEL.pending,
        at: historyMap.get('pending') ?? null,
        state: 'done',
      },
      {
        key: 'cancelled',
        label: ORDER_STATUS_LABEL.cancelled,
        at: historyMap.get('cancelled') ?? null,
        state: 'done',
      },
    ]
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status)

  return ORDER_STATUS_FLOW.map((step, index) => ({
    key: step,
    label: ORDER_STATUS_LABEL[step],
    at: historyMap.get(step) ?? null,
    state: getStepState(status, index, currentIndex),
  }))
}

export default function OrderTimeline({
  status,
  statusHistory = [],
}: {
  status: OrderStatusType
  statusHistory?: OrderStatusEvent[]
}) {
  const steps = buildTimelineSteps(status, statusHistory)

  return (
    <ol className="relative space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const isCancelledStep = status === 'cancelled' && step.key === 'cancelled'
        const isDeliveredComplete = status === 'delivered' && step.key === 'delivered' && step.state === 'done'
        const nextStep = steps[index + 1]
        const lineToCancelled = status === 'cancelled' && nextStep?.key === 'cancelled'

        return (
          <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[11px] top-6 h-[calc(100%-12px)] w-px',
                  lineToCancelled ? 'bg-danger/40' : step.state === 'done' ? 'bg-success/50' : 'bg-white/10',
                )}
              />
            )}

            <span
              className={cn(
                'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2',
                isCancelledStep && 'border-danger bg-danger text-white',
                !isCancelledStep && step.state === 'done' && 'border-success bg-success text-white',
                step.state === 'current' && 'border-primary bg-primary text-white shadow-[0_0_0_4px_rgba(255,107,44,0.15)]',
                step.state === 'upcoming' && 'border-white/15 bg-charcoal text-text-grey',
              )}
            >
              {isCancelledStep ? (
                <XMarkIcon className="size-3.5" />
              ) : step.state === 'done' ? (
                <CheckIcon className="size-3.5" />
              ) : (
                <span className="size-2 rounded-full bg-current" />
              )}
            </span>

            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  'text-sm font-semibold',
                  isCancelledStep && 'text-danger',
                  !isCancelledStep && step.state === 'current' && 'text-off-white',
                  !isCancelledStep && step.state === 'done' && 'text-text-muted',
                  step.state === 'upcoming' && 'text-text-grey',
                )}
              >
                {step.label}
                {step.state === 'current' && (
                  <span className="ml-2 text-xs font-medium text-primary">In progress</span>
                )}
                {isDeliveredComplete && (
                  <span className="ml-2 text-xs font-medium text-success">Completed</span>
                )}
              </p>
              {step.state !== 'upcoming' && (
                <p className="mt-1 text-xs text-text-grey">
                  {step.at ? formatDateTime(step.at) : '—'}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
