import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-beige bg-linen">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-muted">
            Your event, beautifully planned. Celebrations organized without the planner fees.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-sage-900">Product</h2>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link className="hover:text-sage-900" href="/#how-it-works">How it works</Link></li>
            <li><Link className="hover:text-sage-900" href="/pricing">Pricing</Link></li>
            <li><Link className="hover:text-sage-900" href="/plan">Plan an event</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-medium text-sage-900">Your account</h2>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link className="hover:text-sage-900" href="/dashboard">Dashboard</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-beige/80">
        <p className="mx-auto max-w-6xl px-5 py-6 text-sm text-muted sm:px-8">
          © {year} Planora. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
