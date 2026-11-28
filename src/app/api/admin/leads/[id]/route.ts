import {NextResponse} from "next/server";
import {z} from "zod";
import {getAdminApiUser} from "@/lib/admin-api";
import {getDb, getRows, getTransactionRows} from "@/lib/db";

const paramsSchema = z.object({id: z.string().uuid()});
const statusSchema = z.object({
  status: z.enum(["new", "contacted", "negotiation", "won", "lost", "archived"]),
});

type RouteContext = {params: Promise<{id: string}>};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await getAdminApiUser();
    if (!user) return NextResponse.json({error: "No autorizado."}, {status: 401});

    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) return NextResponse.json({error: "Consulta inválida."}, {status: 400});

    const db = getDb();
    const rows = await db`
      SELECT id, name, company, email, phone, service, budget, message,
        status, source, consent_at, internal_notes, created_at, updated_at
      FROM public.leads
      WHERE id = ${parsedParams.data.id}
      LIMIT 1
    `;
    const data = getRows<Record<string, unknown>>(rows)[0];
    if (!data) return NextResponse.json({error: "La consulta no existe."}, {status: 404});
    return NextResponse.json({data});
  } catch {
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getAdminApiUser();
    if (!user) return NextResponse.json({error: "No autorizado."}, {status: 401});

    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) return NextResponse.json({error: "Consulta inválida."}, {status: 400});

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({error: "Solicitud inválida."}, {status: 400});
    }

    const parsedBody = statusSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({error: "Estado inválido."}, {status: 400});
    }

    const db = getDb();
    const result = await db.transaction([
      db`SELECT set_config('app.actor_email', ${user.email}, true)`,
      db`
        UPDATE public.leads
        SET status = ${parsedBody.data.status}
        WHERE id = ${parsedParams.data.id}
        RETURNING id, name, company, email, phone, service, budget, message,
          status, source, consent_at, internal_notes, created_at, updated_at
      `,
    ]);
    const data = getTransactionRows<Record<string, unknown>>(result, 1)[0];
    if (!data) return NextResponse.json({error: "La consulta no existe."}, {status: 404});
    return NextResponse.json({data});
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    if (code === "23503") return NextResponse.json({error: "No se pudo actualizar la consulta."}, {status: 500});
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}
