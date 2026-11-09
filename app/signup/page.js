import Link from "next/link";
import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import SignupForm from "./SignupForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Create an account" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <AuthCard
      title="Start planning."
      intro="Create a free account to save your events and come back to them anytime."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-sage-900 underline decoration-sage-300 underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
