export const ROUTES = {
  home: '/',
  menu: '/menu',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  login: '/login',
  register: '/register',
  admin: '/admin',
  adminMenu: '/admin/menu',
  adminCategories: '/admin/categories',
  adminOrders: '/admin/orders',
  adminCustomers: '/admin/customers',
} as const

export function getMenuItemHref(id: string): string {
  return `${ROUTES.menu}/${id}`
}

export function getOrderDetailHref(id: string): string {
  return `${ROUTES.orders}/${id}`
}

export function getAdminOrderDetailHref(id: string): string {
  return `${ROUTES.adminOrders}/${id}`
}

export function getAdminCustomerDetailHref(id: string): string {
  return `${ROUTES.adminCustomers}/${id}`
}

/** Post-login home: admin console for staff, storefront for customers. */
export function getAuthenticatedHomeHref(role?: string | null): string {
  return role === 'admin' ? ROUTES.admin : ROUTES.home
}
