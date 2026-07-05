'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib'
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
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCategories()
      setCategories(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { categories, loading, error, refresh }
}
