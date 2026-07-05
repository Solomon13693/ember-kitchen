import type { Metadata } from 'next'
import AdminOrderDetailView from '@/views/admin/orders/detail'

export const metadata: Metadata = { title: 'Order Details' }

export default function AdminOrderDetailPage() {
  return <AdminOrderDetailView />
}
