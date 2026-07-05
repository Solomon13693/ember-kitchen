'use client'

import { cn } from '@/lib'

export default function CategoryPill({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className={cn('category-pill text-[10px] font-medium', isActive ? 'text-primary' : 'text-text-muted')}>
      {label}
    </button>
  )
}
