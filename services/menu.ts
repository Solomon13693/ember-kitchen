'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAddonsByMenuItemId } from '@/services/addons'
import { supabase } from '@/lib'
import { queryKeys } from '@/lib/query-keys'
import type { MenuItemPayloadType, MenuItemType } from '@/types'

const MENU_SELECT = '*, categories(id, name, slug), menu_addons(id, name, price, is_available)'

export type MenuItemsFilter = {
  categoryId?: string
  search?: string
}

// ================================
// GET MENU ITEMS
// ================================
export async function getMenuItems(filter: MenuItemsFilter = {}): Promise<MenuItemType[]> {
  let query = supabase.from('menu_items').select(MENU_SELECT).order('created_at', { ascending: false })

  if (filter.categoryId) {
    query = query.eq('category_id', filter.categoryId)
  }
  if (filter.search) {
    query = query.ilike('name', `%${filter.search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

// ================================
// GET MENU ITEM BY ID
// ================================
export async function getMenuItemById(id: string): Promise<MenuItemType | null> {
  const { data, error } = await supabase.from('menu_items').select(MENU_SELECT).eq('id', id).single()
  if (error) return null

  if (!data.menu_addons?.length) {
    try {
      const addons = await getAddonsByMenuItemId(id)
      return { ...data, menu_addons: addons }
    } catch {
      return data
    }
  }

  return data
}

// ================================
// CREATE MENU ITEM (admin)
// ================================
export async function createMenuItem(payload: MenuItemPayloadType): Promise<MenuItemType> {
  const { data, error } = await supabase.from('menu_items').insert(payload).select(MENU_SELECT).single()
  if (error) throw error
  return data
}

// ================================
// UPDATE MENU ITEM (admin)
// ================================
export async function updateMenuItem(
  id: string,
  payload: Partial<MenuItemPayloadType>,
): Promise<MenuItemType> {
  const { data, error } = await supabase
    .from('menu_items')
    .update(payload)
    .eq('id', id)
    .select(MENU_SELECT)
    .single()
  if (error) throw error
  return data
}

// ================================
// DELETE MENU ITEM (admin)
// ================================
export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id)
  if (error) throw error
}

// ================================
// TOGGLE AVAILABILITY (admin)
// ================================
export async function toggleMenuItemAvailability(
  id: string,
  isAvailable: boolean,
): Promise<MenuItemType> {
  return updateMenuItem(id, { is_available: isAvailable })
}

// ================================
// UPLOAD MENU IMAGE (admin)
// ================================
export async function uploadMenuImage(file: File): Promise<string> {
  const path = `${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('menu-images').upload(path, file)
  if (error) throw error

  const { data } = supabase.storage.from('menu-images').getPublicUrl(path)
  return data.publicUrl
}

// ================================
// USE MENU ITEM HOOK (single)
// ================================
export function useMenuItem(id?: string | null) {
  const query = useQuery({
    queryKey: queryKeys.menuItem(id ?? ''),
    queryFn: () => getMenuItemById(id!),
    enabled: !!id,
  })

  return {
    menuItem: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: query.refetch,
  }
}

// ================================
// USE MENU ITEMS HOOK
// ================================
export function useMenuItems(filter: MenuItemsFilter = {}) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.menuItems(filter),
    queryFn: () => getMenuItems(filter),
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.menuItems(filter) })
    return query.refetch()
  }

  return {
    menuItems: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh,
  }
}
