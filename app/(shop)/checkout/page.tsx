import type { Metadata } from 'next'
import CheckoutView from '@/views/checkout'

export const metadata: Metadata = { title: 'Checkout' }

export default function CheckoutPage() {
  return <CheckoutView />
}
