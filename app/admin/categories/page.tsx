import type { Metadata } from 'next'
import AdminCategoriesView from '@/views/admin/categories'

export const metadata: Metadata = { title: 'Categories' }

export default function AdminCategoriesPage() {
  return <AdminCategoriesView />
}
