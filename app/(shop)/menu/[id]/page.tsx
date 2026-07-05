import { Suspense } from 'react'
import MenuDetailView from '@/views/menu/detail'
import { Skeleton, SkeletonLine } from '@/components/ui'

function MenuDetailFallback() {
  return (
    <div className="container page-section">
      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      <SkeletonLine className="mt-4" height="h-8" width="w-2/3" />
      <SkeletonLine className="mt-2" height="h-4" width="w-full" />
    </div>
  )
}

export default function MenuDetailPage() {
  return (
    <Suspense fallback={<MenuDetailFallback />}>
      <MenuDetailView />
    </Suspense>
  )
}
