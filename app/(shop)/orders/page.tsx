import type { Metadata } from 'next'
import OrdersView from '@/views/orders'

export const metadata: Metadata = { title: 'My Orders' }

export default function OrdersPage() {
  return <OrdersView />
}
