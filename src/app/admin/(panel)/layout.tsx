import type { Metadata } from "next";
import "../admin.css";
import { getAdminSession } from "@/lib/admin-auth";
import AdminShell, { AdminLoginRedirect } from "./AdminShell";

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
  if (!session || session.role !== "ADMIN") {
    return <AdminLoginRedirect />;
  }
  return <AdminShell session={session}>{children}</AdminShell>;
}