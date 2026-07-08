'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useCartStore, cartSubtotal } from '@/store'
import { cartLineTotal } from '@/types'
import type { OrderFulfillmentType, PaymentMethodType } from '@/types'
import { useAuth } from '@/services'
import { useToast } from '@/hooks'
import { formatCurrency } from '@/utils'
import { getOrderDetailHref, ROUTES } from '@/constants'
import { cn } from '@/lib'
import { createCodOrder, initializePaystackOrder, verifyPaystackPayment } from '@/lib/api-client'
import { EmptyState, Input, TextArea } from '@/components/ui'
import Button from '@/components/ui/button'
import { OrderItemAddonsList } from '@/components/order'
import { CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline'

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

const PAYMENT_OPTIONS: Array<{
  key: PaymentMethodType
  label: string
  hint: string
  icon: typeof CreditCardIcon
}> = [
  { key: 'paystack', label: 'Card', hint: 'Debit or credit card via Paystack', icon: CreditCardIcon },
  { key: 'cod', label: 'Cash on Delivery', hint: 'Pay when your order arrives', icon: BanknotesIcon },
]

const CheckoutView = () => {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const items = useCartStore(state => state.items)
  const clearCart = useCartStore(state => state.clearCart)
  const { showSuccess, showError } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('paystack')
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

  const buildOrderPayload = (values: CheckoutFormValues) => ({
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
  })

  const completeCheckout = (orderId: string, orderNumber: string, message: string) => {
    clearCart()
    showSuccess(message, `Order ${orderNumber} has been received.`)
    router.push(getOrderDetailHref(orderId))
  }

  const openPaystackPopup = async (
    params: { accessCode: string; reference: string; orderId: string; orderNumber: string },
    email: string,
  ) => {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      throw new Error('Paystack is not configured (missing public key)')
    }

    const PaystackPop = (await import('@paystack/inline-js')).default
    const popup = new PaystackPop()

    return new Promise<void>((resolve, reject) => {
      popup.newTransaction({
        key: publicKey,
        email,
        amount: Math.round(subtotal * 100),
        access_code: params.accessCode,
        reference: params.reference,
        onSuccess: async transaction => {
          setVerifying(true)
          try {
            await verifyPaystackPayment(transaction.reference, params.orderId)
            completeCheckout(params.orderId, params.orderNumber, 'Payment successful!')
            resolve()
          } catch (error) {
            setVerifying(false)
            reject(error)
          }
        },
        onCancel: () => {
          showError('Payment cancelled', 'Your cart is unchanged. You can try again when ready.')
          resolve()
        },
      })
    })
  }

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!user) return
    setSubmitting(true)
    try {
      const payload = buildOrderPayload(values)

      if (paymentMethod === 'cod') {
        const order = await createCodOrder(payload)
        completeCheckout(order.id, order.order_number, 'Order placed!')
        return
      }

      if (!user.email) {
        throw new Error('Your account needs an email address for Paystack payments')
      }

      const init = await initializePaystackOrder(payload)
      setSubmitting(false)
      await openPaystackPopup(
        {
          accessCode: init.accessCode,
          reference: init.reference,
          orderId: init.orderId,
          orderNumber: init.orderNumber,
        },
        user.email,
      )
    } catch (error) {
      showError(
        paymentMethod === 'cod' ? 'Could not place order' : 'Payment failed',
        error instanceof Error ? error.message : 'Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {verifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-card-dark px-8 py-7 text-center shadow-xl">
            <svg className="size-10 animate-spin text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <div>
              <p className="font-display text-lg font-bold text-off-white">Verifying payment</p>
              <p className="mt-1 text-sm text-text-muted">Please wait while we confirm your payment…</p>
            </div>
          </div>
        </div>
      )}

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

          <div className="border-t border-white/10 pt-4">
            <p className="mb-3 text-sm font-semibold text-off-white">Payment method</p>
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map(option => {
                const Icon = option.icon
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setPaymentMethod(option.key)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                      paymentMethod === option.key
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-white/10 hover:bg-white/5',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg',
                        paymentMethod === option.key ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-muted',
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-off-white">{option.label}</span>
                      <span className="mt-0.5 block text-xs text-text-muted">{option.hint}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <Button type="submit" loading={submitting} fullWidth>
            {paymentMethod === 'cod' ? 'Place Order' : 'Pay with Card'}
          </Button>
        </div>
      </form>
      </div>
    </>
  )
}

export default CheckoutView
