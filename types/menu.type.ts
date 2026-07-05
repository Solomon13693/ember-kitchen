import type { AddonType } from './addon.type'

export type CategoryType = {
  id: string
  name: string
  slug: string
  image_url: string | null
  created_at: string
}

export type MenuItemType = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  category_id: string | null
  created_at: string
  categories?: Pick<CategoryType, 'id' | 'name' | 'slug'> | null
  menu_addons?: Array<Pick<AddonType, 'id' | 'name' | 'price' | 'is_available'>>
}

export type CategoryPayloadType = {
  name: string
  slug: string
  image_url?: string | null
}

export type MenuItemPayloadType = {
  name: string
  description?: string | null
  price: number
  image_url?: string | null
  is_available?: boolean
  category_id: string
}
