'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { getMenuItemById } from '@/services'
import { useCartStore } from '@/store'
import { useToast } from '@/hooks'
import { formatCurrency } from '@/utils'
import { ROUTES } from '@/constants'
import { RemoteImage, Skeleton, SkeletonLine } from '@/components/ui'
import { cn } from '@/lib'
import type { CartAddonType, MenuItemType } from '@/types'

const MenuDetailView = () => {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const addItem = useCartStore(state => state.addItem)
  const replaceItem = useCartStore(state => state.replaceItem)
  const { showSuccess } = useToast()

  const editCartKey = searchParams.get('cartKey')
  const addonQuery = searchParams.get('addons') ?? ''
  const qtyQuery = searchParams.get('qty')
  const isEditingCart = Boolean(editCartKey)

  const [item, setItem] = useState<MenuItemType | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getMenuItemById(id).then(data => {
      if (!isMounted) return

      setItem(data)

      const availableIds = new Set((data?.menu_addons ?? []).filter(addon => addon.is_available).map(addon => addon.id))
      const cartItem = editCartKey
        ? useCartStore.getState().items.find(entry => entry.cartKey === editCartKey)
        : undefined
      const addonIdsFromCart = cartItem?.addons.map(addon => addon.id) ?? []
      const addonIdsFromUrl = addonQuery.split(',').filter(Boolean)
      const preferredAddonIds = addonIdsFromCart.length > 0 ? addonIdsFromCart : addonIdsFromUrl
      const validAddonIds = preferredAddonIds.filter(addonId => availableIds.has(addonId))

      setSelectedAddonIds(validAddonIds)

      if (cartItem) {
        setQuantity(cartItem.quantity)
      } else {
        const parsedQty = qtyQuery ? Number.parseInt(qtyQuery, 10) : 1
        setQuantity(Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : 1)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [id, editCartKey, addonQuery, qtyQuery])

  const availableAddons = useMemo(
    () => (item?.menu_addons ?? []).filter(addon => addon.is_available),
    [item?.menu_addons],
  )

  const selectedAddons: CartAddonType[] = useMemo(
    () =>
      availableAddons
        .filter(addon => selectedAddonIds.includes(addon.id))
        .map(addon => ({ id: addon.id, name: addon.name, price: addon.price })),
    [availableAddons, selectedAddonIds],
  )

  const addonTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
  const unitPrice = (item?.price ?? 0) + addonTotal
  const lineTotal = unitPrice * quantity

  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds(current =>
      current.includes(addonId) ? current.filter(id => id !== addonId) : [...current, addonId],
    )
  }

  if (loading) {
    return (
      <div className="container page-section">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="space-y-3">
            <SkeletonLine height="h-8" width="w-2/3" />
            <SkeletonLine height="h-4" width="w-1/3" />
            <SkeletonLine height="h-20" width="w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container page-section text-center">
        <p className="text-lg font-semibold text-off-white">Food item not found</p>
        <button onClick={() => router.push(ROUTES.menu)} className="mt-4 text-sm font-semibold text-primary">
          ← Back to menu
        </button>
      </div>
    )
  }

  const handleAddToCart = () => {
    const payload = {
      menu_item_id: item.id,
      name: item.name,
      base_price: item.price,
      image_url: item.image_url,
      addons: selectedAddons,
    }

    if (isEditingCart && editCartKey) {
      replaceItem(editCartKey, payload, quantity)
      showSuccess('Cart updated', `${quantity} × ${item.name}`)
      router.push(ROUTES.cart)
      return
    }

    addItem(payload, quantity)
    showSuccess('Added to cart', `${quantity} × ${item.name}`)
  }

  return (
    <div className="container page-section pb-24 md:pb-10">
      <div className="grid items-start gap-8 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white/5 md:sticky md:top-20 md:self-start">
          {item.image_url ? (
            <RemoteImage src={item.image_url} alt={item.name} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">🍲</div>
          )}
        </div>

        <div className="min-w-0">
          {item.categories?.name && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {item.categories.name}
            </span>
          )}
          <h1 className="mt-3 font-display text-3xl font-bold text-off-white">{item.name}</h1>
          <p className="mt-2 text-sm text-text-grey">
            Base price{' '}
            <span className="text-xl font-bold text-primary">{formatCurrency(item.price)}</span>
          </p>
          {item.description && <p className="mt-4 text-sm leading-relaxed text-text-muted">{item.description}</p>}

          {availableAddons.length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/6 bg-card-dark/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-off-white">
                    {isEditingCart ? 'Edit add-ons' : 'Customize your order'}
                  </h2>
                  <p className="mt-0.5 text-xs text-text-grey">Select any add-ons you want</p>
                </div>
                {selectedAddons.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {selectedAddons.length} selected
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {availableAddons.map(addon => {
                  const isSelected = selectedAddonIds.includes(addon.id)
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                        isSelected
                          ? 'border-primary/50 bg-primary/10 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.15)]'
                          : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                          isSelected ? 'border-primary bg-primary text-white' : 'border-white/20 bg-charcoal',
                        )}
                      >
                        {isSelected && <span className="text-[11px] font-bold">✓</span>}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-off-white">{addon.name}</span>
                      </span>
                      <span className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs font-semibold text-primary">
                        +{formatCurrency(addon.price)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {!item.is_available ? (
            <p className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
              Currently unavailable
            </p>
          ) : (
            <div className="sticky bottom-0 z-20 mt-6 rounded-2xl border border-white/6 bg-card-dark/95 p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md md:bottom-4">
              <h2 className="text-sm font-semibold text-off-white">Order summary</h2>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-text-muted">{item.name}</span>
                  <span className="shrink-0 font-medium text-off-white">{formatCurrency(item.price)}</span>
                </div>

                {selectedAddons.map(addon => (
                  <div key={addon.id} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-text-grey">+ {addon.name}</span>
                    <span className="shrink-0 font-medium text-off-white">{formatCurrency(addon.price)}</span>
                  </div>
                ))}

                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                  <span className="text-sm font-semibold text-off-white">Price per item</span>
                  <span className="text-base font-bold text-primary">{formatCurrency(unitPrice)}</span>
                </div>

                {quantity > 1 && (
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-text-grey">Quantity</span>
                    <span className="font-medium text-off-white">× {quantity}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="flex size-9 items-center justify-center rounded-lg text-off-white transition-colors hover:bg-white/10"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon className="size-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-bold text-off-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="flex size-9 items-center justify-center rounded-lg text-off-white transition-colors hover:bg-white/10"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon className="size-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  {isEditingCart ? 'Update Cart' : 'Add to Cart'} · {formatCurrency(lineTotal)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MenuDetailView
