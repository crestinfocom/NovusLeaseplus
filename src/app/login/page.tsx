import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your NovusLease+ account to manage bookings, subscriptions and driver profiles.",
};

type LoginPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

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
      <LoginForm next={next} />
    </AuthShell>
  );
}
