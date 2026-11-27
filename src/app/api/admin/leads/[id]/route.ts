import {NextResponse} from "next/server";
import {z} from "zod";
import {getAdminApiClient} from "@/lib/admin-api";

const paramsSchema = z.object({id: z.string().uuid()});
const statusSchema = z.object({
  status: z.enum(["new", "contacted", "negotiation", "won", "lost", "archived"]),
});

type RouteContext = {params: Promise<{id: string}>};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const db = await getAdminApiClient();
    if (!db) return NextResponse.json({error: "No autorizado."}, {status: 401});

    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) return NextResponse.json({error: "Consulta inválida."}, {status: 400});

    const {data, error} = await db
      .from("leads")
      .select("id,name,company,email,phone,service,budget,message,status,source,consent_at,internal_notes,created_at,updated_at")
      .eq("id", parsedParams.data.id)
      .maybeSingle();

    if (error) return NextResponse.json({error: "No se pudo cargar la consulta."}, {status: 500});
    if (!data) return NextResponse.json({error: "La consulta no existe."}, {status: 404});
    return NextResponse.json({data});
  } catch {
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const db = await getAdminApiClient();
    if (!db) return NextResponse.json({error: "No autorizado."}, {status: 401});

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

    const {data, error} = await db
      .from("leads")
      .update({status: parsedBody.data.status})
      .eq("id", parsedParams.data.id)
      .select("id,name,company,email,phone,service,budget,message,status,source,consent_at,internal_notes,created_at,updated_at")
      .maybeSingle();

    if (error) return NextResponse.json({error: "No se pudo actualizar la consulta."}, {status: 500});
    if (!data) return NextResponse.json({error: "La consulta no existe."}, {status: 404});
    return NextResponse.json({data});
  } catch {
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}
