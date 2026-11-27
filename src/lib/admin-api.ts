import {createClient} from "@/lib/supabase/server";
import {isAdmin} from "@/lib/auth";

export async function getAdminApiClient() {
  const db = await createClient();
  const {data, error} = await db.auth.getUser();

  if (error || !data.user || !isAdmin(data.user.email, data.user.app_metadata)) {
    return null;
  }

  return db;
}
