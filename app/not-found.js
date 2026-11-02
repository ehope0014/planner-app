import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="font-display text-5xl text-sage-900">This page doesn’t exist.</h1>
      <p className="mt-4 text-lg text-muted">The link may be broken, or the page may have moved.</p>
      <Link
        href="/"
        className="mt-10 inline-block rounded-full bg-sage-700 px-8 py-3.5 font-medium text-ivory hover:bg-sage-900"
      >
        Back to home
      </Link>
    </div>
  );
}
