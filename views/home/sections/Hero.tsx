import Link from 'next/link'
import { ROUTES, BRAND } from '@/constants'

export default function Hero() {
  return (
    <section className="marketing-hero relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(circle at 20% 20%, rgba(249,115,22,0.16), transparent 55%)' }}
      />
      <div className="container flex flex-col items-center text-center">
        <span className="rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          Cash on delivery • Fast pickup
        </span>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-off-white sm:text-5xl">
          Welcome to <span className="text-gradient">{BRAND.name}</span>
        </h1>
        <p className="mt-4 max-w-lg text-base text-text-muted">
          Order delicious rice dishes, soups, proteins and drinks online — for delivery or pickup.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ROUTES.menu}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Browse Menu
          </Link>
          <Link
            href={ROUTES.orders}
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-off-white transition-colors hover:bg-white/5"
          >
            Track an Order
          </Link>
        </div>
      </div>
    </section>
  )
}
