export type CartAddonType = {
  id: string
  name: string
  price: number
}

export type CartItemType = {
  cartKey: string
  menu_item_id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
  addons: CartAddonType[]
}

export function buildCartKey(menuItemId: string, addonIds: string[]): string {
  return `${menuItemId}:${[...addonIds].sort().join(',')}`
}

export function cartLineTotal(item: CartItemType): number {
  return item.price * item.quantity
}
