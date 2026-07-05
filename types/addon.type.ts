export type AddonType = {
  id: string
  menu_item_id: string
  name: string
  price: number
  is_available: boolean
  created_at: string
}

export type AddonPayloadType = {
  menu_item_id: string
  name: string
  price: number
  is_available?: boolean
}

export type AddonDraftType = {
  id?: string
  name: string
  price: number
  is_available: boolean
}

export type OrderItemAddonType = {
  id: string
  name: string
  price: number
}
