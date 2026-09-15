import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your NovusLease+ account to manage bookings, subscriptions and driver profiles.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage bookings, subscriptions and your driver profile."
      footer={
        <>
          New to NovusLease+? <a href="/signup">Create an account</a>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}