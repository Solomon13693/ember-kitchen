'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib'
import type { CustomerDetailType, CustomerSummaryType, OrderStatusType } from '@/types'

type CustomerOrderRow = {
  id: string
  order_number: string
  status: OrderStatusType
  total_amount: number
  created_at: string
}

type OrderRow = {
  user_id: string
  total_amount: number
  created_at: string
  status: OrderStatusType
}

function buildCustomerSummaries(
  profiles: Array<{ id: string; name: string; phone: string | null; role: string; created_at: string }>,
  orders: OrderRow[],
): CustomerSummaryType[] {
  const stats = new Map<string, { count: number; spent: number; lastOrderAt: string | null }>()

  for (const order of orders) {
    const current = stats.get(order.user_id) ?? { count: 0, spent: 0, lastOrderAt: null }
    const spent = order.status === 'cancelled' ? 0 : order.total_amount
    stats.set(order.user_id, {
      count: current.count + 1,
      spent: current.spent + spent,
      lastOrderAt:
        !current.lastOrderAt || new Date(order.created_at) > new Date(current.lastOrderAt)
          ? order.created_at
          : current.lastOrderAt,
    })
  }

  return profiles
    .filter(profile => profile.role === 'customer')
    .map(profile => {
      const summary = stats.get(profile.id) ?? { count: 0, spent: 0, lastOrderAt: null }
      return {
        ...profile,
        role: profile.role as CustomerSummaryType['role'],
        order_count: summary.count,
        total_spent: summary.spent,
        last_order_at: summary.lastOrderAt,
      }
    })
    .sort((a, b) => {
      const aTime = a.last_order_at ? new Date(a.last_order_at).getTime() : 0
      const bTime = b.last_order_at ? new Date(b.last_order_at).getTime() : 0
      return bTime - aTime
    })
}

export async function getAllCustomers(): Promise<CustomerSummaryType[]> {
  const [{ data: profiles, error: profilesError }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.from('profiles').select('id, name, phone, role, created_at').order('created_at', { ascending: false }),
    supabase.from('orders').select('user_id, total_amount, created_at, status'),
  ])

  if (profilesError) throw profilesError
  if (ordersError) throw ordersError

  return buildCustomerSummaries(profiles ?? [], orders ?? [])
}

export async function getCustomerById(id: string): Promise<CustomerDetailType | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, phone, role, created_at')
    .eq('id', id)
    .single()

  if (profileError) return null

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  if (ordersError) throw ordersError

  const orderList = orders ?? []
  const total_spent = orderList
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total_amount, 0)

  return {
    ...profile,
    role: profile.role as CustomerDetailType['role'],
    orders: orderList as CustomerOrderRow[],
    order_count: orderList.length,
    total_spent,
  }
}

export function useAllCustomers() {
  const [customers, setCustomers] = useState<CustomerSummaryType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllCustomers()
      setCustomers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { customers, loading, error, refresh }
}

export function useCustomer(id?: string | null) {
  const [customer, setCustomer] = useState<CustomerDetailType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setCustomer(null)
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    getCustomerById(id).then(data => {
      if (!isMounted) return
      setCustomer(data)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [id])

  return { customer, loading }
}
