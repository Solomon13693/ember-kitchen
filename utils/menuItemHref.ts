import type { CartItemType } from '@/types'

export function getMenuItemHrefWithAddons(menuItemId: string, addonIds: string[]): string {
  const params = new URLSearchParams()
  if (addonIds.length > 0) {
    params.set('addons', addonIds.join(','))
  }
  const query = params.toString()
  return query ? `/menu/${menuItemId}?${query}` : `/menu/${menuItemId}`
}

export function getMenuItemEditHref(item: CartItemType): string {
  const params = new URLSearchParams()
  params.set('cartKey', item.cartKey)
  if (item.addons.length > 0) {
    params.set('addons', item.addons.map(addon => addon.id).join(','))
  }
  if (item.quantity > 1) {
    params.set('qty', String(item.quantity))
  }
  return `/menu/${item.menu_item_id}?${params.toString()}`
}
