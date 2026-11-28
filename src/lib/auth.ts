import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { isAdmin } from "@/lib/auth-utils";

export { isAdmin } from "@/lib/auth-utils";

export async function requireAdmin() {
  const result = await auth.getSession().catch(() => null);

  if (!result) {
    redirect("/login?error=configuration");
  }

  const user = result.data?.user;

  if (!user || !isAdmin(user.email)) {
    redirect("/login");
  }

  return user;
}
