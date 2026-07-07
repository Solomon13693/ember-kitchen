'use client'

import { useId } from 'react'
import { cn } from '@/lib'

type LogoMarkProps = {
  size?: number
  className?: string
}

export default function LogoMark({ size = 48, className }: LogoMarkProps) {
  const uid = useId().replace(/:/g, '')
  const bg = `sw-bg-${uid}`
  const food = `sw-food-${uid}`
  const rim = `sw-rim-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={bg} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB923C" />
          <stop stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id={food} x1="20" y1="24" x2="44" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDBA74" />
          <stop stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id={rim} x1="16" y1="34" x2="48" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF8F0" />
          <stop stopColor="#FED7AA" />
        </linearGradient>
      </defs>

      <rect width="64" height="64" rx="14" fill={`url(#${bg})`} />
      <rect x="1.5" y="1.5" width="61" height="61" rx="12.5" stroke="white" strokeOpacity="0.18" />

      {/* Steam */}
      <path
        d="M24 17c0-3 2-5 2-5s2 2 2 5-2 5-2-5Z"
        fill="#FFF8F0"
        fillOpacity="0.9"
      />
      <path
        d="M32 12c0-4 2.5-6.5 2.5-6.5S37 8 37 12s-2.5 6.5-2.5 6.5S32 16 32 12Z"
        fill="#FFF8F0"
      />
      <path
        d="M40 17c0-3 2-5 2-5s2 2 2 5-2 5-2-5Z"
        fill="#FFF8F0"
        fillOpacity="0.9"
      />

      {/* Bowl */}
      <path
        d="M14 36c0 0 4.5 16 18 16s18-16 18-16H14Z"
        fill={`url(#${rim})`}
      />
      <ellipse cx="32" cy="36" rx="18" ry="5.5" fill="#FFF8F0" />

      {/* Food mound */}
      <path
        d="M18 35.5c3-6 13-8 14-8s11 2 14 8c-5 2-23 2-28 0Z"
        fill={`url(#${food})`}
      />
      <ellipse cx="32" cy="31" rx="11" ry="4" fill="#F97316" opacity="0.55" />

      {/* Fork & spoon handles — subtle food cues */}
      <path
        d="M17 44v8"
        stroke="#FEF3C7"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M15 44h4" stroke="#FEF3C7" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <path
        d="M47 44c0-3 2-3 2-3s2 0 2 3v8"
        stroke="#FEF3C7"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Gold sparkle — wealth accent */}
      <circle cx="49" cy="15" r="3.5" fill="#FBBF24" />
      <circle cx="49" cy="15" r="1.5" fill="#FEF9C3" />
    </svg>
  )
}
