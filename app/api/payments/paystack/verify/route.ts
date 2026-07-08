import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { requireUser, jsonError } from '@/lib/server/auth'
import { verifyTransaction } from '@/lib/paystack'

export async function POST(request: Request) {
  try {
    const user = await requireUser(request)
    const body = (await request.json()) as { reference?: string; orderId?: string }

    if (!body.reference || !body.orderId) {
      return Response.json({ error: 'reference and orderId are required' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, payment_reference, payment_status, total_amount')
      .eq('id', body.orderId)
      .single()

    if (orderError || !order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.user_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (order.payment_reference !== body.reference) {
      return Response.json({ error: 'Reference mismatch' }, { status: 400 })
    }

    if (order.payment_status === 'paid') {
      return Response.json({ success: true, orderId: order.id })
    }

    const verified = await verifyTransaction(body.reference)
    if (verified.status !== 'success') {
      await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', order.id)
      return Response.json({ error: 'Payment was not successful' }, { status: 400 })
    }

    const expectedKobo = Math.round(Number(order.total_amount) * 100)
    if (verified.amount !== expectedKobo) {
      return Response.json({ error: 'Payment amount mismatch' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', order.id)

    if (updateError) throw updateError

    return Response.json({ success: true, orderId: order.id })
  } catch (error) {
    return jsonError(error)
  }
}
