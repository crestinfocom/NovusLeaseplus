import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { adminLoginUrl } from "@/lib/auth-redirect";

export default async function AdminHomePage() {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    redirect(adminLoginUrl("/admin"));
  }
  redirect("/admin/dashboard");
}
