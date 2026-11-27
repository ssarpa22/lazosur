import {NextResponse} from "next/server";
import {z} from "zod";
import {getAdminApiClient} from "@/lib/admin-api";

const paramsSchema = z.object({collection: z.enum(["projects", "services"]), id: z.string().uuid()});
const slugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const projectSchema = z.object({
  name: z.string().trim().min(2).max(120), slug: slugSchema,
  description: z.string().trim().min(10).max(2000),
  category: z.string().trim().min(2).max(80),
  image_url: z.union([z.string().url().max(2048), z.literal("")]).nullable(),
  gallery: z.array(z.string().url().max(2048)).max(12),
  external_url: z.union([z.string().url().max(2048), z.literal("")]).nullable(),
  published: z.boolean(), sort_order: z.number().int().min(0).max(10000),
}).partial().strict();
const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120), slug: slugSchema,
  description: z.string().trim().min(10).max(2000),
  content: z.string().max(12000).nullable(),
  meta_title: z.string().trim().max(70).nullable(),
  meta_description: z.string().trim().max(170).nullable(),
  published: z.boolean(), sort_order: z.number().int().min(0).max(10000),
}).partial().strict();

type RouteContext = {params: Promise<{collection: string; id: string}>};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const db = await getAdminApiClient();
    if (!db) return NextResponse.json({error: "No autorizado."}, {status: 401});
    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) return NextResponse.json({error: "Contenido inválido."}, {status: 400});
    const {data, error} = await db.from(parsed.data.collection).select("*").eq("id", parsed.data.id).maybeSingle();
    if (error) return NextResponse.json({error: "No se pudo cargar el contenido."}, {status: 500});
    if (!data) return NextResponse.json({error: "El contenido no existe."}, {status: 404});
    return NextResponse.json({data});
  } catch {
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const db = await getAdminApiClient();
    if (!db) return NextResponse.json({error: "No autorizado."}, {status: 401});
    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) return NextResponse.json({error: "Contenido inválido."}, {status: 400});
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({error: "JSON inválido."}, {status: 400}); }
    const schema = parsed.data.collection === "projects" ? projectSchema : serviceSchema;
    const parsedBody = schema.safeParse(body);
    if (!parsedBody.success || Object.keys(parsedBody.data ?? {}).length === 0) {
      return NextResponse.json({error: parsedBody.success ? "No hay cambios para guardar." : parsedBody.error.issues[0]?.message ?? "Datos inválidos."}, {status: 400});
    }
    const {data, error} = await db.from(parsed.data.collection).update(parsedBody.data).eq("id", parsed.data.id).select("*").maybeSingle();
    if (error?.code === "23505") return NextResponse.json({error: "Ya existe un contenido con ese slug."}, {status: 409});
    if (error) return NextResponse.json({error: "No se pudo actualizar el contenido."}, {status: 500});
    if (!data) return NextResponse.json({error: "El contenido no existe."}, {status: 404});
    return NextResponse.json({data});
  } catch {
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}
