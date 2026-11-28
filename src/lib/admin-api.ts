import "server-only";

import { auth } from "@/lib/auth/server";
import { isAdmin } from "@/lib/auth";

export async function getAdminApiUser() {
  const session = await auth.getSession().catch(() => null);
  const user = session?.data?.user;

  if (!user || !isAdmin(user.email)) return null;
  return { email: user.email!.trim().toLowerCase() };
}
