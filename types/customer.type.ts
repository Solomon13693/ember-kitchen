import type { ProfileType } from './auth.type'
import type { OrderStatusType } from './order.type'

export type CustomerSummaryType = ProfileType & {
  order_count: number
  total_spent: number
  last_order_at: string | null
}

export type CustomerDetailType = ProfileType & {
  orders: Array<{
    id: string
    order_number: string
    status: OrderStatusType
    total_amount: number
    created_at: string
  }>
  order_count: number
  total_spent: number
}
