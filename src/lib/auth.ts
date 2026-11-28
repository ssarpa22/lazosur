import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export function isAdmin(email?: string | null) {
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Boolean(
    email &&
    allowedEmails.includes(email.trim().toLowerCase()),
  );
}

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
