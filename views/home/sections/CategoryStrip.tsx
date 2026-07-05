'use client'

import Link from 'next/link'
import { ROUTES } from '@/constants'
import { useCategories } from '@/services'
import { Skeleton } from '@/components/ui'

export default function CategoryStrip() {
  const { categories, loading } = useCategories()

  if (!loading && categories.length === 0) return null

  return (
    <section className="py-8">
      <div className="container">
        <h2 className="mb-4 font-display text-xl font-bold text-off-white">Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[68px] w-28 shrink-0 rounded-2xl" />)
            : categories.map(category => (
                <Link
                  key={category.id}
                  href={`${ROUTES.menu}?category=${category.id}`}
                  className="category-pill shrink-0 text-sm font-semibold text-off-white"
                >
                  {category.name}
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}
