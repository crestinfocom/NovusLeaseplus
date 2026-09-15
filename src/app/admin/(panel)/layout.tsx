import { redirect } from "next/navigation";
import type { Metadata } from "next";
import "../admin.css";
import { getAdminSession } from "@/lib/admin-auth";
import AdminShell from "./AdminShell";

export const metadata: Metadata = {
  title: {
    default: "Admin Console",
    template: `%s · Admin Console`,
  },
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return <AdminShell session={session}>{children}</AdminShell>;
}