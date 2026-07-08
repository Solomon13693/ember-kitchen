import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { requireUser, jsonError } from '@/lib/server/auth'
import { createOrderWithItems, type CreateOrderInput } from '@/lib/server/orders'
import { generatePaymentReference, initializeTransaction } from '@/lib/paystack'

export async function POST(request: Request) {
  try {
    const user = await requireUser(request)
    if (!user.email) {
      return Response.json({ error: 'Account email is required for Paystack' }, { status: 400 })
    }

    const body = (await request.json()) as CreateOrderInput
    if (!body.items?.length) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const reference = generatePaymentReference()
    const totalAmount = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const amountKobo = Math.round(totalAmount * 100)

    if (amountKobo < 100) {
      return Response.json({ error: 'Order total is too low for Paystack' }, { status: 400 })
    }

    const paystack = await initializeTransaction({
      email: user.email,
      amountKobo,
      reference,
    })

    const supabase = createSupabaseAdmin()
    const order = await createOrderWithItems(supabase, user.id, body, {
      payment_method: 'paystack',
      payment_status: 'pending',
      payment_reference: paystack.reference,
    })

    return Response.json({
      orderId: order.id,
      orderNumber: order.order_number,
      accessCode: paystack.access_code,
      reference: paystack.reference,
    })
  } catch (error) {
    return jsonError(error)
  }
}
