import Sprig from "@/components/Sprig";

// Shared frame for the log in and sign up pages
export default function AuthCard({ title, intro, children, footer }) {
  return (
    <div className="relative mx-auto max-w-md px-5 pb-10 pt-14 sm:pt-20">
      <Sprig className="pointer-events-none absolute -right-16 top-4 hidden h-80 w-auto text-sage-300 sm:block" />
      <div className="stationery relative rounded-sm px-7 py-10 sm:px-10">
        <h1 className="font-display text-4xl text-sage-900 sm:text-5xl">{title}</h1>
        {intro && <p className="mt-3 text-muted">{intro}</p>}
        <div className="mt-8">{children}</div>
      </div>
      {footer && <p className="relative mt-6 text-center text-muted">{footer}</p>}
    </div>
  );
}

export const authInput =
  "mt-2 block w-full rounded-xl border border-beige bg-ivory px-4 py-3 text-ink placeholder:text-muted/60 focus:border-sage-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sage-300 aria-[invalid=true]:border-rose";

export const authButton =
  "w-full rounded-full bg-sage-700 px-8 py-3.5 font-medium text-ivory transition-colors hover:bg-sage-900 disabled:cursor-wait disabled:opacity-70";
