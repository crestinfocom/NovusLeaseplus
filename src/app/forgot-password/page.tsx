import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description:
    "Reset your NovusLease+ password with the email address linked to your account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send you a reset link."
      footer={
        <>
          Remembered it? <a href="/login">Back to login</a>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}