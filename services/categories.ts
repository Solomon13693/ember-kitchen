'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib'
import { queryKeys } from '@/lib/query-keys'
import type { CategoryPayloadType, CategoryType } from '@/types'

// ================================
// GET CATEGORIES
// ================================
export async function getCategories(): Promise<CategoryType[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data ?? []
}

// ================================
// CREATE CATEGORY (admin)
// ================================
export async function createCategory(payload: CategoryPayloadType): Promise<CategoryType> {
  const { data, error } = await supabase.from('categories').insert(payload).select().single()
  if (error) throw error
  return data
}

// ================================
// UPDATE CATEGORY (admin)
// ================================
export async function updateCategory(
  id: string,
  payload: Partial<CategoryPayloadType>,
): Promise<CategoryType> {
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ================================
// DELETE CATEGORY (admin)
// ================================
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

// ================================
// UPLOAD CATEGORY IMAGE (admin)
// ================================
export async function uploadCategoryImage(file: File): Promise<string> {
  const path = `categories/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('menu-images').upload(path, file)
  if (error) throw error

  const { data } = supabase.storage.from('menu-images').getPublicUrl(path)
  return data.publicUrl
}

// ================================
// USE CATEGORIES HOOK
// ================================
export function useCategories() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.categories })
    return query.refetch()
  }

  return {
    categories: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh,
  }
}
