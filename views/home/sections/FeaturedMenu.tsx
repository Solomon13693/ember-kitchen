'use client'

import Link from 'next/link'
import { ROUTES } from '@/constants'
import { useMenuItems } from '@/services'
import { MenuCard } from '@/components/menu'
import { MenuGridSkeleton } from '@/components/ui'

export default function FeaturedMenu() {
  const { menuItems, loading } = useMenuItems()
  const featured = menuItems.slice(0, 8)

  return (
    <section className="pb-10">
      <div className="container">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-off-white">Popular right now</h2>
          <Link href={ROUTES.menu} className="text-sm font-semibold text-primary hover:text-primary-dark">
            View full menu →
          </Link>
        </div>

        {loading ? (
          <MenuGridSkeleton count={8} />
        ) : featured.length === 0 ? (
          <p className="rounded-2xl border border-white/6 bg-white/3 p-8 text-center text-sm text-text-grey">
            No menu items yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map(item => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
