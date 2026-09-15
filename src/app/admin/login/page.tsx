import type { Metadata } from "next";
import "./../admin.css";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Console",
  description: "Sign in to the NovusLease+ admin console.",
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}