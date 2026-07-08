import { supabase } from '@/lib/supabase'
import type { OrderType, PlaceOrderPayloadType } from '@/types'

async function authHeaders(): Promise<HeadersInit> {
  const { data: refreshed, error } = await supabase.auth.refreshSession()
  const token = refreshed.session?.access_token

  if (!token) {
    const { data } = await supabase.auth.getSession()
    const fallbackToken = data.session?.access_token
    if (!fallbackToken) {
      throw new Error(error?.message ?? 'Please sign in to continue')
    }
    return {
      Authorization: `Bearer ${fallbackToken}`,
      'Content-Type': 'application/json',
    }
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()

  let json: T & { error?: string }
  try {
    json = JSON.parse(text) as T & { error?: string }
  } catch {
    throw new Error(
      res.ok
        ? 'Invalid server response'
        : 'Something went wrong. Please refresh and try again.',
    )
  }

  if (!res.ok) {
    throw new Error(json.error ?? 'Request failed')
  }
  return json
}

export async function createCodOrder(payload: PlaceOrderPayloadType): Promise<OrderType> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  })
  const json = await parseJson<{ order: OrderType }>(res)
  return json.order
}

export type PaystackInitializeResult = {
  orderId: string
  orderNumber: string
  accessCode: string
  reference: string
}

export async function initializePaystackOrder(
  payload: PlaceOrderPayloadType,
): Promise<PaystackInitializeResult> {
  const res = await fetch('/api/payments/paystack/initialize', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  })
  return parseJson<PaystackInitializeResult>(res)
}

export async function verifyPaystackPayment(reference: string, orderId: string): Promise<void> {
  const res = await fetch('/api/payments/paystack/verify', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ reference, orderId }),
  })
  await parseJson<{ success: boolean }>(res)
}
