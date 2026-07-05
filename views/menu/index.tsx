'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useCategories, useMenuItems } from '@/services'
import { useDebouncedValue } from '@/hooks'
import { MenuCard, CategoryPill } from '@/components/menu'
import { MenuGridSkeleton } from '@/components/ui'
import { cn } from '@/lib'
import { BRAND } from '@/constants'

const MenuView = () => {
  const searchParams = useSearchParams()
  const [categoryId, setCategoryId] = useState<string | undefined>(searchParams.get('category') ?? undefined)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)

  const { categories } = useCategories()
  const { menuItems, loading } = useMenuItems({ categoryId, search: debouncedSearch || undefined })

  return (
    <div className="page-section">
      <div className="container">
        <h1 className="font-display text-3xl font-bold text-off-white">Our Menu</h1>
        <p className="mt-2 text-sm text-text-muted">Browse everything {BRAND.name} has to offer.</p>

        <div className="relative mt-6 max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-grey" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search food..."
            className="form-control pl-10!"
          />
        </div>

        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <CategoryPill label="All" isActive={!categoryId} onClick={() => setCategoryId(undefined)} />
          {categories.map(category => (
            <CategoryPill
              key={category.id}
              label={category.name}
              isActive={categoryId === category.id}
              onClick={() => setCategoryId(category.id)}
            />
          ))}
        </div>

        <div className={cn('mt-6', loading && 'opacity-70')}>
          {loading ? (
            <MenuGridSkeleton count={9} />
          ) : menuItems.length === 0 ? (
            <p className="rounded-2xl border border-white/6 bg-white/3 p-10 text-center text-sm text-text-grey">
              No menu items match your search.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {menuItems.map(item => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MenuView
