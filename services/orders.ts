'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib'
import { generateOrderNumber, normalizeAddons, toOrderItemAddons } from '@/utils'
import { ORDER_STATUS_FLOW } from '@/types'
import type { OrderStatusType, OrderType, PlaceOrderPayloadType } from '@/types'

const ORDER_SELECT =
  '*, profiles(id, name, phone, role, created_at), order_items(*, menu_items(id, name, image_url)), order_status_events(status, created_at)'

type OrderStatusEvent = {
  status: OrderStatusType
  at: string
}

function normalizeOrder(order: OrderType | null): OrderType | null {
  if (!order) return null

  return {
    ...order,
    order_items: order.order_items?.map(item => ({
      ...item,
      addons: normalizeAddons(item.addons),
    })),
  }
}

function mapStatusHistory(order: OrderType | null): OrderStatusEvent[] {
  if (!order?.order_status_events?.length) return []

  const flowIndex = (status: OrderStatusType) => {
    const index = ORDER_STATUS_FLOW.indexOf(status)
    return index === -1 ? 999 : index
  }

  return order.order_status_events
    .map(event => ({ status: event.status, at: event.created_at }))
    .sort((a, b) => flowIndex(a.status) - flowIndex(b.status))
}

// ================================
// PLACE ORDER
// ================================
export async function placeOrder(
  payload: PlaceOrderPayloadType,
  userId: string,
): Promise<OrderType> {
  const totalAmount = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
      user_id: userId,
      type: payload.type,
      total_amount: totalAmount,
      address: payload.address ?? null,
      phone: payload.phone,
      notes: payload.notes ?? '',
    })
    .select()
    .single()
  if (orderError) throw orderError

  const { error: itemsError } = await supabase.from('order_items').insert(
    payload.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price: item.price,
      addons: toOrderItemAddons(normalizeAddons(item.addons)),
    })),
  )
  if (itemsError) throw itemsError

  return order
}

// ================================
// GET MY ORDERS
// ================================
export async function getMyOrders(userId: string): Promise<OrderType[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(order => normalizeOrder(order)!)
}

// ================================
// GET ORDER BY ID
// ================================
export async function getOrderById(id: string): Promise<OrderType | null> {
  const { data, error } = await supabase.from('orders').select(ORDER_SELECT).eq('id', id).single()
  if (error) return null
  return normalizeOrder(data)
}

// ================================
// GET ALL ORDERS (admin)
// ================================
export async function getAllOrders(status?: OrderStatusType): Promise<OrderType[]> {
  let query = supabase.from('orders').select(ORDER_SELECT).order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(order => normalizeOrder(order)!)
}

// ================================
// UPDATE ORDER STATUS (admin)
// ================================
export async function updateOrderStatus(id: string, status: OrderStatusType): Promise<OrderType> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(ORDER_SELECT)
    .single()
  if (error) throw error
  return normalizeOrder(data)!
}

// ================================
// USE MY ORDERS HOOK
// ================================
export function useMyOrders(userId?: string | null) {
  const [orders, setOrders] = useState<OrderType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setOrders([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await getMyOrders(userId)
      setOrders(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { orders, loading, error, refresh }
}

// ================================
// USE ALL ORDERS HOOK (admin)
// ================================
export function useAllOrders(status?: OrderStatusType) {
  const [orders, setOrders] = useState<OrderType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllOrders(status)
      setOrders(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { orders, loading, error, refresh }
}

// ================================
// USE ORDER TRACKING HOOK (realtime)
// ================================
export function useOrderTracking(orderId?: string | null) {
  const [order, setOrder] = useState<OrderType | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!orderId) return null
    const data = await getOrderById(orderId)
    setOrder(data)
    return data
  }, [orderId])

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    getOrderById(orderId).then(data => {
      if (!isMounted) return
      setOrder(data)
      setLoading(false)
    })

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        () => {
          refresh()
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_status_events', filter: `order_id=eq.${orderId}` },
        () => {
          refresh()
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [orderId, refresh])

  const statusHistory = useMemo(() => mapStatusHistory(order), [order])

  return { order, loading, refresh, statusHistory }
}
