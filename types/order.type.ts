import type { MenuItemType } from './menu.type'
import type { OrderItemAddonType } from './addon.type'
import type { ProfileType } from './auth.type'

export type OrderStatusType = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export type OrderFulfillmentType = 'delivery' | 'pickup'

export const ORDER_STATUS_FLOW: OrderStatusType[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
]

export type OrderItemType = {
  id: string
  order_id: string
  menu_item_id: string | null
  quantity: number
  price: number
  addons?: OrderItemAddonType[]
  menu_items?: Pick<MenuItemType, 'id' | 'name' | 'image_url'> | null
}

export type OrderStatusEventType = {
  status: OrderStatusType
  created_at: string
}

export type OrderType = {
  id: string
  order_number: string
  user_id: string
  status: OrderStatusType
  type: OrderFulfillmentType
  total_amount: number
  address: string | null
  phone: string
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItemType[]
  order_status_events?: OrderStatusEventType[]
  profiles?: Pick<ProfileType, 'id' | 'name' | 'phone' | 'role' | 'created_at'> | null
}

export type PlaceOrderPayloadType = {
  type: OrderFulfillmentType
  address?: string
  phone: string
  notes?: string
  items: Array<{
    menu_item_id: string
    quantity: number
    price: number
    addons?: OrderItemAddonType[]
  }>
}
