import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

export function isAdmin(email?: string | null, appMetadata?: Record<string, unknown> | null) {
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Boolean(
    email &&
    appMetadata?.role === "admin" &&
    allowedEmails.includes(email.toLowerCase()),
  );
}

export async function requireAdmin() {
  let db;
  try {
    db = await createClient();
  } catch {
    redirect("/login?error=configuration");
  }

  const {data, error} = await db.auth.getUser();
  if (error || !data.user || !isAdmin(data.user.email, data.user.app_metadata)) {
    redirect("/login");
  }

  return data.user;
}
