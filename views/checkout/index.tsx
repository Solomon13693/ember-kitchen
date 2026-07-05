'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useCartStore, cartSubtotal } from '@/store'
import { cartLineTotal } from '@/types'
import { useAuth } from '@/services'
import { placeOrder } from '@/services'
import { useToast } from '@/hooks'
import { formatCurrency } from '@/utils'
import { getOrderDetailHref, ROUTES } from '@/constants'
import { cn } from '@/lib'
import { EmptyState, Input, TextArea } from '@/components/ui'
import Button from '@/components/ui/button'
import { OrderItemAddonsList } from '@/components/order'
import type { OrderFulfillmentType } from '@/types'

type CheckoutFormValues = {
  type: OrderFulfillmentType
  address?: string
  phone: string
  notes?: string
}

const schema = yup.object({
  type: yup.string().oneOf(['delivery', 'pickup']).required(),
  address: yup.string().when('type', {
    is: 'delivery',
    then: s => s.required('Delivery address is required'),
  }),
  phone: yup.string().required('Phone number is required'),
  notes: yup.string(),
})

const CheckoutView = () => {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const items = useCartStore(state => state.items)
  const clearCart = useCartStore(state => state.clearCart)
  const { showSuccess, showError } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const subtotal = cartSubtotal(items)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: yupResolver(schema) as unknown as Resolver<CheckoutFormValues>,
    defaultValues: { type: 'delivery' },
  })

  const fulfillmentType = watch('type')

  if (!authLoading && !isAuthenticated) {
    return (
      <EmptyState
        title="Please sign in to checkout"
        action={{ label: 'Go to Login', href: ROUTES.login }}
      />
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        action={{ label: 'Browse Menu', href: ROUTES.menu }}
      />
    )
  }

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!user) return
    setSubmitting(true)
    try {
      const order = await placeOrder(
        {
          type: values.type,
          address: values.type === 'delivery' ? values.address : undefined,
          phone: values.phone,
          notes: values.notes,
          items: items.map(item => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            price: item.price,
            addons: item.addons,
          })),
        },
        user.id,
      )
      clearCart()
      showSuccess('Order placed!', `Order ${order.order_number} has been received.`)
      router.push(getOrderDetailHref(order.id))
    } catch (error) {
      showError('Could not place order', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container page-section">
      <h1 className="font-display text-3xl font-bold text-off-white">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-5">
            <p className="mb-3 text-sm font-semibold text-off-white">Fulfillment</p>
            <div className="flex gap-3">
              {(['delivery', 'pickup'] as OrderFulfillmentType[]).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue('type', option, { shouldValidate: true })}
                  className={cn(
                    'flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize transition-colors',
                    fulfillmentType === option
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-white/10 text-text-muted hover:bg-white/5',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {fulfillmentType === 'delivery' && (
            <TextArea label="Delivery Address" {...register('address')} error={errors.address?.message} placeholder="Street, city, state" />
          )}

          <Input label="Phone Number" {...register('phone')} error={errors.phone?.message} placeholder="080..." />
          <TextArea label="Notes (optional)" {...register('notes')} placeholder="Extra spicy, no onions, etc." />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-text-muted">
            Payment method: <span className="font-semibold text-off-white">Cash on Delivery</span>
          </div>
        </div>

        <div className="h-fit space-y-4 rounded-2xl border border-white/6 bg-card-dark/60 p-5">
          <h2 className="font-display text-lg font-bold text-off-white">Order Summary</h2>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.cartKey} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between text-sm text-text-muted">
                  <span className="font-medium text-off-white">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="shrink-0 text-off-white">{formatCurrency(cartLineTotal(item))}</span>
                </div>
                <OrderItemAddonsList addons={item.addons} compact variant="chips" />
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-sm font-bold text-off-white">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(subtotal)}</span>
          </div>
          <Button type="submit" loading={submitting} fullWidth>
            Place Order
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CheckoutView
