import type { Metadata } from 'next'
import { Suspense } from 'react'
import AdminLoginView from '@/views/auth/admin-login'

export const metadata: Metadata = { title: 'Admin Sign In' }

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginView />
    </Suspense>
  )
}
