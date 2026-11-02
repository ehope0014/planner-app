import Link from "next/link";

export default function Logo({ className = "" }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 text-sage-900 ${className}`}
      aria-label="Planora home"
    >
      <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M14 52C28 44 34 30 48 12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M25 41c-7-1-11-6-12-11 7 0 11 5 12 11Z M33 31c6-2 11-1 14 3-6 2-11 1-14-3Z M38 24c-5-2-8-7-7-12 5 2 7 7 7 12Z" fill="currentColor" />
      </svg>
      <span className="font-display text-[1.75rem] leading-none tracking-wide">Planora</span>
    </Link>
  );
}
