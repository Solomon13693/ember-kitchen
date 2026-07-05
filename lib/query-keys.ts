import type { MenuItemsFilter } from '@/services/menu'

export const queryKeys = {
  categories: ['categories'] as const,
  menuItems: (filter: MenuItemsFilter = {}) =>
    ['menu-items', 'v2', filter.categoryId ?? null, filter.search ?? null] as const,
  menuItem: (id: string) => ['menu-item', 'v2', id] as const,
  myOrders: (userId: string) => ['my-orders', userId] as const,
  allOrders: (status?: string) => ['all-orders', status ?? null] as const,
  order: (id: string) => ['order', id] as const,
}
