import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { requireUser, jsonError } from '@/lib/server/auth'
import { createOrderWithItems, type CreateOrderInput } from '@/lib/server/orders'

export async function POST(request: Request) {
  try {
    const user = await requireUser(request)
    const body = (await request.json()) as CreateOrderInput

    if (!body.items?.length) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const order = await createOrderWithItems(supabase, user.id, body, {
      payment_method: 'cod',
      payment_status: 'not_required',
      payment_reference: null,
    })

    return Response.json({ order })
  } catch (error) {
    return jsonError(error)
  }
}
