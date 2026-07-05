import type { Metadata } from 'next'
import AdminOrdersView from '@/views/admin/orders'

export const metadata: Metadata = { title: 'Orders' }

export default function AdminOrdersPage() {
  return <AdminOrdersView />
}
