'use client'

import Link from 'next/link'
import { useAllCustomers } from '@/services'
import { formatCurrency } from '@/utils'
import { getAdminCustomerDetailHref } from '@/constants'
import { DataTable, type Column } from '@/components/ui'
import type { CustomerSummaryType } from '@/types'

const columns: Column[] = [
  { key: 'customer', title: 'Customer' },
  { key: 'orders', title: 'Orders' },
  { key: 'spent', title: 'Total spent' },
  { key: 'last', title: 'Last order' },
  { key: 'joined', title: 'Joined' },
]

export default function AdminCustomersView() {
  const { customers, loading } = useAllCustomers()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">Customers</h1>
      <p className="mt-1 text-sm text-text-muted">See who is ordering and track their activity.</p>

      <div className="mt-6">
        <DataTable<CustomerSummaryType>
          columns={columns}
          data={customers}
          loading={loading}
          rowKey={customer => customer.id}
          emptyMessage="No customers yet."
          renderRow={customer => (
            <>
              <td className="px-6 py-4">
                <Link href={getAdminCustomerDetailHref(customer.id)} className="group block">
                  <p className="text-sm font-semibold text-off-white group-hover:text-primary">{customer.name}</p>
                  <p className="text-xs text-text-grey">{customer.phone ?? 'No phone on profile'}</p>
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-text-muted">{customer.order_count}</td>
              <td className="px-6 py-4 text-sm font-semibold text-primary">
                {formatCurrency(customer.total_spent)}
              </td>
              <td className="px-6 py-4 text-xs text-text-grey">
                {customer.last_order_at ? new Date(customer.last_order_at).toLocaleString() : '—'}
              </td>
              <td className="px-6 py-4 text-xs text-text-grey">
                {new Date(customer.created_at).toLocaleDateString()}
              </td>
            </>
          )}
        />
      </div>
    </div>
  )
}
