import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CART_STORAGE_KEY } from '@/constants'
import { normalizeAddons } from '@/utils'
import { buildCartKey, cartLineTotal, type CartAddonType, type CartItemType } from '@/types'

type AddToCartPayload = {
  menu_item_id: string
  name: string
  base_price: number
  image_url: string | null
  addons?: CartAddonType[]
}

type CartState = {
  items: CartItemType[]
  addItem: (item: AddToCartPayload, quantity?: number) => void
  replaceItem: (cartKey: string, item: AddToCartPayload, quantity: number) => void
  removeItem: (cartKey: string) => void
  setQuantity: (cartKey: string, quantity: number) => void
  incrementItem: (cartKey: string) => void
  decrementItem: (cartKey: string) => void
  clearCart: () => void
}

function normalizeItem(item: CartItemType): CartItemType {
  const addons = normalizeAddons(item.addons)
  const menu_item_id = item.menu_item_id ?? (item as CartItemType & { id?: string }).id ?? item.cartKey
  const cartKey = item.cartKey ?? buildCartKey(menu_item_id, addons.map(addon => addon.id))
  return {
    cartKey,
    menu_item_id,
    name: item.name,
    price: item.price,
    image_url: item.image_url,
    quantity: item.quantity,
    addons,
  }
}

function buildCartLine(item: AddToCartPayload, quantity: number): CartItemType {
  const addons = normalizeAddons(item.addons)
  const cartKey = buildCartKey(item.menu_item_id, addons.map(addon => addon.id))
  const price = item.base_price + addons.reduce((sum, addon) => sum + addon.price, 0)

  return {
    cartKey,
    menu_item_id: item.menu_item_id,
    name: item.name,
    price,
    image_url: item.image_url,
    quantity,
    addons,
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const nextLine = buildCartLine(item, quantity)
        const existing = get().items.find(i => i.cartKey === nextLine.cartKey)

        if (existing) {
          set({
            items: get().items.map(i =>
              i.cartKey === nextLine.cartKey ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          })
          return
        }

        set({ items: [...get().items, nextLine] })
      },

      replaceItem: (cartKey, item, quantity) => {
        const remaining = get().items.filter(i => i.cartKey !== cartKey)
        const nextLine = buildCartLine(item, quantity)
        const existing = remaining.find(i => i.cartKey === nextLine.cartKey)

        if (existing) {
          set({
            items: remaining.map(i =>
              i.cartKey === nextLine.cartKey ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          })
          return
        }

        set({ items: [...remaining, nextLine] })
      },

      removeItem: cartKey => {
        set({ items: get().items.filter(i => i.cartKey !== cartKey) })
      },

      setQuantity: (cartKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartKey)
          return
        }
        set({ items: get().items.map(i => (i.cartKey === cartKey ? { ...i, quantity } : i)) })
      },

      incrementItem: cartKey => {
        set({
          items: get().items.map(i => (i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i)),
        })
      },

      decrementItem: cartKey => {
        const item = get().items.find(i => i.cartKey === cartKey)
        if (!item) return
        get().setQuantity(cartKey, item.quantity - 1)
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      merge: (persisted, current) => {
        const state = persisted as CartState | undefined
        if (!state?.items) return current
        return {
          ...current,
          items: state.items.map(item => normalizeItem(item as CartItemType)),
        }
      },
    },
  ),
)

export function cartItemCount(items: CartItemType[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function cartSubtotal(items: CartItemType[]): number {
  return items.reduce((sum, item) => sum + cartLineTotal(item), 0)
}
