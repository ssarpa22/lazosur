import {NextResponse} from "next/server";
import {getAdminApiUser} from "@/lib/admin-api";
import {getDb} from "@/lib/db";

const statuses = ["new", "contacted", "negotiation", "won", "lost", "archived"] as const;

export async function GET(request: Request) {
  try {
    const user = await getAdminApiUser();
    if (!user) return NextResponse.json({error: "No autorizado."}, {status: 401});

    const params = new URL(request.url).searchParams;
    const rawPage = Number(params.get("page") ?? "1");
    const page = Number.isInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 10000) : 1;
    const rawStatus = params.get("status") ?? "all";
    if (rawStatus !== "all" && !statuses.includes(rawStatus as (typeof statuses)[number])) {
      return NextResponse.json({error: "Filtro de estado inválido."}, {status: 400});
    }

    const search = (params.get("q") ?? "")
      .replace(/[^\p{L}\p{N}\s@.+_-]/gu, " ")
      .trim()
      .slice(0, 80);
    const statusFilter = rawStatus === "all" ? null : rawStatus;
    const term = search || null;
    const pattern = term ? `%${term}%` : null;
    const pageSize = 20;
    const offset = (page - 1) * pageSize;
    const db = getDb();

    const [data, countRows] = await Promise.all([
      db`
        SELECT id, name, company, email, status, created_at
        FROM public.leads
        WHERE (${statusFilter}::text IS NULL OR status = ${statusFilter})
          AND (
            ${pattern}::text IS NULL
            OR name ILIKE ${pattern}
            OR email ILIKE ${pattern}
            OR company ILIKE ${pattern}
          )
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `,
      db`
        SELECT count(*)::int AS total
        FROM public.leads
        WHERE (${statusFilter}::text IS NULL OR status = ${statusFilter})
          AND (
            ${pattern}::text IS NULL
            OR name ILIKE ${pattern}
            OR email ILIKE ${pattern}
            OR company ILIKE ${pattern}
          )
      `,
    ]);

    return NextResponse.json({
      data,
      total: Number(countRows[0]?.total ?? 0),
      page,
      pageSize,
    });
  } catch {
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}
