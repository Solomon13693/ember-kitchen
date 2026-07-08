import type { SupabaseClient } from '@supabase/supabase-js'
import { generateOrderNumber } from '@/utils/orderNumber'
import { normalizeAddons, toOrderItemAddons } from '@/utils/addons'
import type { OrderFulfillmentType, OrderItemAddonType, OrderType } from '@/types'

export type CreateOrderItemInput = {
  menu_item_id: string
  quantity: number
  price: number
  addons?: OrderItemAddonType[]
}

export type CreateOrderInput = {
  type: OrderFulfillmentType
  address?: string
  phone: string
  notes?: string
  items: CreateOrderItemInput[]
}

export type PaymentFields = {
  payment_method: 'cod' | 'paystack'
  payment_status: 'not_required' | 'pending' | 'paid' | 'failed'
  payment_reference?: string | null
}

export async function createOrderWithItems(
  supabase: SupabaseClient,
  userId: string,
  payload: CreateOrderInput,
  payment: PaymentFields,
): Promise<OrderType> {
  const totalAmount = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
      user_id: userId,
      type: payload.type,
      total_amount: totalAmount,
      address: payload.address ?? null,
      phone: payload.phone,
      notes: payload.notes ?? '',
      payment_method: payment.payment_method,
      payment_status: payment.payment_status,
      payment_reference: payment.payment_reference ?? null,
    })
    .select()
    .single()

  if (orderError) throw orderError

  const { error: itemsError } = await supabase.from('order_items').insert(
    payload.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price: item.price,
      addons: toOrderItemAddons(normalizeAddons(item.addons)),
    })),
  )

  if (itemsError) throw itemsError

  return order as OrderType
}
