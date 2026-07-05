export {
  registerCustomer,
  loginWithPassword,
  logoutUser,
  getProfile,
  useAuth,
  useLogout,
} from './auth'

export {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  useCategories,
} from './categories'

export {
  getAllCustomers,
  getCustomerById,
  useAllCustomers,
  useCustomer,
} from './customers'

export {
  getAddonsByMenuItemId,
  syncMenuItemAddons,
} from './addons'

export {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  uploadMenuImage,
  useMenuItems,
  useMenuItem,
} from './menu'
export type { MenuItemsFilter } from './menu'

export {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  useMyOrders,
  useAllOrders,
  useOrderTracking,
} from './orders'
