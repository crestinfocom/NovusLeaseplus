import { NextResponse, type NextRequest } from "next/server";
import { getAdminLoginPath } from "@/lib/auth-redirect";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/admin/login") return NextResponse.next();
  if (request.cookies.get("nl_admin")) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", getAdminLoginPath(pathname));
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
