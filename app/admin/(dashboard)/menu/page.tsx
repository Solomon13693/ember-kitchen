import type { Metadata } from 'next'
import AdminMenuView from '@/views/admin/menu'

export const metadata: Metadata = { title: 'Menu' }

export default function AdminMenuPage() {
  return <AdminMenuView />
}
