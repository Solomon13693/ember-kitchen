import Link from 'next/link'
import { ROUTES, BRAND } from '@/constants'
import { Logo } from '@/components/brand'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-charcoal">
      <header className="flex justify-center py-6">
        <Link href={ROUTES.home} className="transition-opacity hover:opacity-90">
          <Logo size="lg" />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center pb-10">{children}</main>
    </div>
  )
}
