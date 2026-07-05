import type { Metadata } from 'next'
import { Suspense } from 'react'
import MenuView from '@/views/menu'

export const metadata: Metadata = { title: 'Menu' }

export default function MenuPage() {
  return (
    <Suspense>
      <MenuView />
    </Suspense>
  )
}
