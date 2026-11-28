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

/** Normalize the default Neon HTTP result shape without depending on its overload union. */
export function getRows<T extends Record<string, unknown>>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (typeof result === "object" && result !== null && "rows" in result) {
    const rows = (result as {rows?: unknown}).rows;
    if (Array.isArray(rows)) return rows as T[];
  }
  return [];
}

/** Read one statement's rows from the array returned by neon().transaction(). */
export function getTransactionRows<T extends Record<string, unknown>>(
  result: unknown,
  statementIndex: number,
): T[] {
  if (!Array.isArray(result)) return [];
  return getRows<T>(result[statementIndex]);
}
