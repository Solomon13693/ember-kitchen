'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusIcon } from '@heroicons/react/24/outline'
import { RemoteImage } from '@/components/ui'
import { getMenuItemHref } from '@/constants'
import { useCartStore } from '@/store'
import { formatCurrency } from '@/utils'
import type { MenuItemType } from '@/types'

function hasAvailableAddons(item: MenuItemType) {
  return (item.menu_addons ?? []).some(addon => addon.is_available)
}

export default function MenuCard({ item }: { item: MenuItemType }) {
  const router = useRouter()
  const addItem = useCartStore(state => state.addItem)
  const itemHasAddons = hasAvailableAddons(item)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (itemHasAddons) {
      router.push(getMenuItemHref(item.id))
      return
    }

    addItem({
      menu_item_id: item.id,
      name: item.name,
      base_price: item.price,
      image_url: item.image_url,
    })
  }

  return (
    <Link href={getMenuItemHref(item.id)} className="food-card group block">
      <div className="relative aspect-9/7 w-full overflow-hidden bg-white/5">
        {item.image_url ? (
          <RemoteImage
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl bg-white/80"></div>
        )}
        {!item.is_available && (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase text-off-white">
            Unavailable
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="truncate text-sm font-semibold text-off-white">{item.name}</p>
        {item.description && (
          <p className="mt-1 line-clamp-1 text-xs text-text-grey">{item.description}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-primary">{formatCurrency(item.price)}</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!item.is_available}
            aria-label={itemHasAddons ? `Customize ${item.name}` : `Add ${item.name} to cart`}
            className="flex size-8 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon className="size-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
