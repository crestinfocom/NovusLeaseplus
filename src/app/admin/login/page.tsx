import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminLoginUrl } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Admin Console",
  description: "Sign in to the NovusLease+ admin console.",
};

export default function AdminLoginPage() {
  redirect(adminLoginUrl("/admin/dashboard"));
}
