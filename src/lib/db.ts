import "server-only";

import { neon } from "@neondatabase/serverless";

type NeonClient = ReturnType<typeof neon>;
let client: NeonClient | undefined;

export function getDb(): NeonClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está configurada.");
  }

  // Runtime uses the pooled connection string for the least-privilege
  // lazo_sur_app role. DATABASE_URL_UNPOOLED is reserved for migrations.
  client ??= neon(connectionString);
  return client;
}
