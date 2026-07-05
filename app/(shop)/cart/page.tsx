import type { Metadata } from 'next'
import CartView from '@/views/cart'

export const metadata: Metadata = { title: 'Your Cart' }

export default function CartPage() {
  return <CartView />
}
