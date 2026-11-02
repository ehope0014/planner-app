"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the page changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-beige/70 bg-ivory/90 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <Logo />

        <div className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="text-[0.95rem] text-muted transition-colors hover:text-sage-900 aria-[current=page]:text-sage-900"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/plan"
            className="rounded-full bg-sage-700 px-5 py-2.5 text-[0.95rem] font-medium text-ivory transition-colors hover:bg-sage-900"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-sage-900 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <path d="M5 5l12 12M17 5L5 17" />
            ) : (
              <path d="M3 7h16M3 15h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-beige/70 bg-ivory md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-5 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-beige/50 py-3.5 text-lg text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/plan"
              className="mt-5 rounded-full bg-sage-700 px-5 py-3 text-center font-medium text-ivory"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
