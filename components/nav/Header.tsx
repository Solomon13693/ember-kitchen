'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib'
import { ROUTES } from '@/constants'
import { useAuth, useLogout } from '@/services'
import { useCartStore, cartItemCount } from '@/store'
import { Logo } from '@/components/brand'
import MobileNav from './MobileNav'

const NAV_LINKS = [
  { href: ROUTES.home, label: 'Home' },
  { href: ROUTES.menu, label: 'Menu' },
]

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isAuthenticated, profile } = useAuth()
  const count = useCartStore(state => cartItemCount(state.items))
  const { signOut } = useLogout()

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-charcoal/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href={ROUTES.home} className="transition-opacity hover:opacity-90">
          <Logo size="md" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-text-muted transition-colors hover:text-off-white">
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link href={ROUTES.orders} className="text-sm font-medium text-text-muted transition-colors hover:text-off-white">
              My Orders
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.cart}
            className="relative flex size-10 items-center justify-center rounded-full bg-white/5 text-off-white transition-colors hover:bg-white/10"
            aria-label="Cart"
          >
            <ShoppingCartIcon className="size-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-text-muted">Hi, {profile?.name?.split(' ')[0] ?? 'there'}</span>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-sm font-medium text-text-muted transition-colors hover:text-off-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href={ROUTES.login} className="text-sm font-medium text-text-muted transition-colors hover:text-off-white">
                  Login
                </Link>
                <Link
                  href={ROUTES.register}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileOpen(open => !open)}
            className={cn('flex size-10 items-center justify-center rounded-full bg-white/5 text-off-white md:hidden')}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <XMarkIcon className="size-5" /> : <Bars3Icon className="size-5" />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <MobileNav
          isAuthenticated={isAuthenticated}
          onNavigate={() => setIsMobileOpen(false)}
          onLogout={signOut}
        />
      )}
    </header>
  )
}
