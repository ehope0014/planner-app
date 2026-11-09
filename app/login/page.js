import Link from "next/link";
import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import LoginForm from "./LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { next } = await searchParams;

  return (
    <AuthCard
      title="Welcome back."
      intro="Log in to pick up your plans where you left off."
      footer={
        <>
          New to Planora?{" "}
          <Link href="/signup" className="font-medium text-sage-900 underline decoration-sage-300 underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={typeof next === "string" ? next : "/dashboard"} />
    </AuthCard>
  );
}
