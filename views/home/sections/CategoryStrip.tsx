'use client'

import Link from 'next/link'
import { ROUTES } from '@/constants'
import { useCategories } from '@/services'
import { Skeleton } from '@/components/ui'
import { CategoryPill } from '@/components'

export default function CategoryStrip() {
  const { categories, loading } = useCategories()

  if (!loading && categories.length === 0) return null

  return (
    <section className="py-8">
      <div className="container">
        <h2 className="mb-4 font-display text-xl font-bold text-off-white">Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-28 shrink-0 rounded-xl" />)
            : categories.map(category => (
                <CategoryPill key={category.id} label={category.name} isActive={false} onClick={() => {}} />
              ))}
        </div>
      </div>
    </section>
  )
}
