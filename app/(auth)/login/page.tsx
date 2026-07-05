import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginView from '@/views/auth/login'

export const metadata: Metadata = { title: 'Login' }

export default function LoginPage() {
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  )
}
