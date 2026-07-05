import type { CartAddonType, OrderItemAddonType } from '@/types'

type RawAddon = {
  id?: string
  name?: string
  price?: number | string
}

export function normalizeAddons(raw: unknown): CartAddonType[] {
  if (!raw) return []

  let parsed: unknown = raw
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return []
    }
  }

  if (!Array.isArray(parsed)) return []

  return parsed
    .filter((entry): entry is RawAddon => Boolean(entry && typeof entry === 'object'))
    .map((entry, index) => ({
      id: String(entry.id ?? `${entry.name ?? 'addon'}-${index}`),
      name: String(entry.name ?? 'Add-on'),
      price: Number(entry.price) || 0,
    }))
}

export function toOrderItemAddons(addons: CartAddonType[]): OrderItemAddonType[] {
  return addons.map(addon => ({
    id: addon.id,
    name: addon.name,
    price: addon.price,
  }))
}
