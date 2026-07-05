'use client'

import { ToastContainer } from '@/components'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
}
