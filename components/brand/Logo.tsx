import Image from 'next/image'
import { cn } from '@/lib'
import { BRAND } from '@/constants'

type LogoProps = {
  className?: string
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { icon: 46, text: 'text-base' },
  md: { icon: 50, text: 'text-base' },
  lg: { icon: 60, text: 'text-base' },
} as const

export default function Logo({ className, showWordmark = true, size = 'md' }: LogoProps) {
  const { icon, text } = sizeMap[size]

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Image
        src="/logo.png"
        alt={`${BRAND.name} logo`}
        width={icon}
        height={icon}
        className="shrink-0 rounded-xl"
        priority
      />
      {showWordmark && (
        <span className={cn('font-display font-bold tracking-tight text-off-white', text)}>
          {BRAND.name}
        </span>
      )}
    </span>
  )
}
