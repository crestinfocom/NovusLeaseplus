import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create your NovusLease+ account — choose an individual, corporate, personal driver or commercial driver account.",
};

export default function SignupPage() {
  return (
    <AuthShell
      step="Step 1 of 2 — account type & details"
      title="Create your account"
      subtitle="Pick the account type that fits how you drive with NovusLease+."
      footer={
        <>
          Already have an account? <a href="/login">Sign in</a>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}