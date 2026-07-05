'use client'

import { useRouter } from 'next/navigation'
import { useCartStore, cartSubtotal } from '@/store'
import { ROUTES } from '@/constants'
import { formatCurrency } from '@/utils'
import { CartItemRow } from '@/components/cart'
import { EmptyState } from '@/components/ui'

const CartView = () => {
  const items = useCartStore(state => state.items)
  const clearCart = useCartStore(state => state.clearCart)
  const router = useRouter()
  const subtotal = cartSubtotal(items)

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        description="Add some delicious food to get started."
        action={{ label: 'Browse Menu', href: ROUTES.menu }}
      />
    )
  }

  return (
    <div className="container page-section">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-off-white">Your Cart</h1>
        <button type="button" onClick={clearCart} className="text-sm font-medium text-text-grey hover:text-danger">
          Clear cart
        </button>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map(item => (
            <CartItemRow key={item.cartKey} item={item} />
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-white/6 bg-card-dark/60 p-5">
          <h2 className="font-display text-lg font-bold text-off-white">Order Summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-text-muted">
            <span>Subtotal</span>
            <span className="font-semibold text-off-white">{formatCurrency(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-text-grey">Delivery fee (if any) is confirmed at checkout.</p>
          <button
            type="button"
            onClick={() => router.push(ROUTES.checkout)}
            className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartView
