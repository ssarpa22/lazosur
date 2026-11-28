import "server-only";

import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está configurada.");
}

// Runtime must use the pooled connection string for the least-privilege
// lazo_sur_app role. DATABASE_URL_UNPOOLED is reserved for migrations.
export const sql = neon(connectionString);
