import type { Metadata } from 'next'
import RegisterView from '@/views/auth/register'

export const metadata: Metadata = { title: 'Create Account' }

export default function RegisterPage() {
  return <RegisterView />
}
