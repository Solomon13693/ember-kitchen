'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAllOrders, updateOrderStatus } from '@/services'
import { useToast } from '@/hooks'
import { formatCurrency } from '@/utils'
import { getAdminOrderDetailHref, getAdminCustomerDetailHref, ORDER_STATUS_FILTERS, ORDER_STATUS_LABEL } from '@/constants'
import { TabNavigation, DataTable, type Column } from '@/components/ui'
import { OrderStatusBadge } from '@/components/order'
import type { OrderStatusType, OrderType } from '@/types'

const columns: Column[] = [
  { key: 'order', title: 'Order' },
  { key: 'customer', title: 'Customer' },
  { key: 'type', title: 'Type' },
  { key: 'total', title: 'Total' },
  { key: 'status', title: 'Status' },
  { key: 'date', title: 'Date' },
]

const STATUS_OPTIONS: OrderStatusType[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

export default function AdminOrdersView() {
  const [activeStatus, setActiveStatus] = useState('all')
  const { orders, loading, refresh } = useAllOrders(
    activeStatus === 'all' ? undefined : (activeStatus as OrderStatusType),
  )
  const { showSuccess, showError } = useToast()

  const handleStatusChange = async (order: OrderType, status: OrderStatusType) => {
    if (status === order.status) return
    try {
      await updateOrderStatus(order.id, status)
      showSuccess('Order status updated')
      refresh()
    } catch (error) {
      showError('Update failed', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">Orders</h1>
      <p className="mt-1 text-sm text-text-muted">View and update customer orders.</p>

      <div className="mt-6">
        <TabNavigation
          items={ORDER_STATUS_FILTERS.map(f => ({ key: f.key, label: f.label }))}
          activeKey={activeStatus}
          onTabChange={setActiveStatus}
        />
      </div>

      <div className="mt-6">
        <DataTable<OrderType>
          columns={columns}
          data={orders}
          loading={loading}
          rowKey={order => order.id}
          emptyMessage="No orders in this status."
          renderRow={order => (
            <>
              <td className="px-6 py-4">
                <Link
                  href={getAdminOrderDetailHref(order.id)}
                  className="group block"
                >
                  <p className="text-sm font-semibold text-off-white group-hover:text-primary">{order.order_number}</p>
                  <p className="text-xs text-text-grey">{order.phone}</p>
                </Link>
              </td>
              <td className="px-6 py-4">
                {order.profiles ? (
                  <Link
                    href={getAdminCustomerDetailHref(order.profiles.id)}
                    className="group block"
                  >
                    <p className="text-sm font-medium text-off-white group-hover:text-primary">{order.profiles.name}</p>
                    <p className="text-xs text-text-grey">{order.profiles.phone ?? '—'}</p>
                  </Link>
                ) : (
                  <span className="text-sm text-text-grey">Unknown</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm capitalize text-text-muted">{order.type}</td>
              <td className="px-6 py-4 text-sm font-semibold text-primary">{formatCurrency(order.total_amount)}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order, e.target.value as OrderStatusType)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-off-white"
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {ORDER_STATUS_LABEL[option]}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="px-6 py-4 text-xs text-text-grey">{new Date(order.created_at).toLocaleString()}</td>
            </>
          )}
        />
      </div>
    </div>
  )
}
