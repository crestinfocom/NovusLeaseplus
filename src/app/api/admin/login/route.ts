import { handleLogin } from "@/lib/auth-login";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleLogin(request, { adminOnly: true });
}
