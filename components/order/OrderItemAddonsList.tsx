import { formatCurrency } from '@/utils'
import { cn } from '@/lib'
import type { CartAddonType, OrderItemAddonType } from '@/types'

type AddonLike = CartAddonType | OrderItemAddonType

export default function OrderItemAddonsList({
  addons,
  compact = false,
  variant = 'list',
}: {
  addons: AddonLike[]
  compact?: boolean
  variant?: 'list' | 'chips'
}) {
  if (!addons.length) return null

  if (variant === 'chips') {
    return (
      <div className={cn('flex flex-wrap gap-1.5', compact ? 'mt-1.5' : 'mt-2')}>
        {addons.map(addon => (
          <span
            key={addon.id}
            className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
          >
            + {addon.name}
            <span className="text-primary/80">({formatCurrency(addon.price)})</span>
          </span>
        ))}
      </div>
    )
  }

  return (
    <ul className={compact ? 'mt-1.5 space-y-1' : 'mt-2 space-y-1.5'}>
      {addons.map(addon => (
        <li
          key={addon.id}
          className="flex items-start justify-between gap-3 rounded-lg bg-white/4 px-2.5 py-1.5 text-xs"
        >
          <span className="font-medium text-off-white">+ {addon.name}</span>
          <span className="shrink-0 font-semibold text-primary">{formatCurrency(addon.price)}</span>
        </li>
      ))}
    </ul>
  )
}
