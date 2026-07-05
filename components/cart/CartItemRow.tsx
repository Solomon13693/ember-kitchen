'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '@/store'
import { cartLineTotal } from '@/types'
import { formatCurrency, getMenuItemEditHref } from '@/utils'
import { OrderItemAddonsList } from '@/components/order'
import type { CartItemType } from '@/types'

export default function CartItemRow({ item }: { item: CartItemType }) {
  const incrementItem = useCartStore(state => state.incrementItem)
  const decrementItem = useCartStore(state => state.decrementItem)
  const removeItem = useCartStore(state => state.removeItem)

  const detailHref = getMenuItemEditHref(item)

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/6 bg-card-dark/60 p-3">
      <Link href={detailHref} className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl">🍲</div>
        )}
      </Link>

      <Link href={detailHref} className="min-w-0 flex-1 transition-opacity hover:opacity-90">
        <p className="truncate text-sm font-semibold text-off-white">{item.name}</p>
        <p className="mt-0.5 text-xs text-text-grey">{formatCurrency(item.price)} each</p>
        <OrderItemAddonsList addons={item.addons} compact variant="chips" />
        <p className="mt-1.5 text-[11px] font-medium text-primary">Tap to edit add-ons</p>
      </Link>

      <div className="flex shrink-0 flex-col items-end gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-1 py-1">
          <button
            type="button"
            onClick={() => decrementItem(item.cartKey)}
            aria-label="Decrease quantity"
            className="flex size-7 items-center justify-center rounded-full text-off-white hover:bg-white/10"
          >
            <MinusIcon className="size-3.5" />
          </button>
          <span className="w-5 text-center text-sm font-semibold text-off-white">{item.quantity}</span>
          <button
            type="button"
            onClick={() => incrementItem(item.cartKey)}
            aria-label="Increase quantity"
            className="flex size-7 items-center justify-center rounded-full text-off-white hover:bg-white/10"
          >
            <PlusIcon className="size-3.5" />
          </button>
        </div>

        <p className="w-20 text-right text-sm font-bold text-primary">
          {formatCurrency(cartLineTotal(item))}
        </p>

        <button
          type="button"
          onClick={() => removeItem(item.cartKey)}
          aria-label={`Remove ${item.name}`}
          className="text-text-grey hover:text-danger"
        >
          <TrashIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}
