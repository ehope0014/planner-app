import { Italiana, Jost } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { unstable_rethrow } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italiana",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Planora | Your event, beautifully planned",
    template: "%s | Planora",
  },
  description:
    "Planora plans birthdays, bridal showers, engagement parties and graduations with you: a personal checklist, a budget that adds up, and a timeline that counts down to the day.",
};

// Every page shows login status, so pages are built per visit
export const dynamic = "force-dynamic";

export const viewport = {
  themeColor: "#fbf8f1",
};

export default async function RootLayout({ children }) {
  // If the database is briefly unreachable, still show the site (as logged out)
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    unstable_rethrow(error); // let Next.js handle its own internal signals
    console.error("Could not check login status:", error);
  }

  return (
    <html lang="en" className={`${italiana.variable} ${jost.variable}`}>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-sage-900"
        >
          Skip to content
        </a>
        <Navbar user={user ? { name: user.name } : null} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
