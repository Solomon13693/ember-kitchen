'use client'

import { supabase } from '@/lib'
import type { AddonDraftType, AddonPayloadType, AddonType } from '@/types'

export async function getAddonsByMenuItemId(menuItemId: string): Promise<AddonType[]> {
  const { data, error } = await supabase
    .from('menu_addons')
    .select('*')
    .eq('menu_item_id', menuItemId)
    .order('created_at')
  if (error) throw error
  return data ?? []
}

export async function syncMenuItemAddons(menuItemId: string, addons: AddonDraftType[]): Promise<void> {
  const { error: deleteError } = await supabase.from('menu_addons').delete().eq('menu_item_id', menuItemId)
  if (deleteError) throw deleteError

  const validAddons = addons.filter(addon => addon.name.trim())
  if (validAddons.length === 0) return

  const rows: AddonPayloadType[] = validAddons.map(addon => ({
    menu_item_id: menuItemId,
    name: addon.name.trim(),
    price: addon.price,
    is_available: addon.is_available,
  }))

  const { error: insertError } = await supabase.from('menu_addons').insert(rows)
  if (insertError) throw insertError
}
