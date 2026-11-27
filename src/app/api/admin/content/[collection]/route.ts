import {NextResponse} from "next/server";
import {z} from "zod";
import {getAdminApiClient} from "@/lib/admin-api";

const collectionSchema = z.enum(["projects", "services"]);
const slugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe usar minúsculas, números y guiones.");
const projectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: z.string().trim().min(10).max(2000),
  category: z.string().trim().min(2).max(80).default("Proyecto propio"),
  image_url: z.union([z.string().url().max(2048), z.literal("")]).nullable().optional(),
  gallery: z.array(z.string().url().max(2048)).max(12).default([]),
  external_url: z.union([z.string().url().max(2048), z.literal("")]).nullable().optional(),
  published: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(10000).default(0),
}).strict();
const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: z.string().trim().min(10).max(2000),
  content: z.string().max(12000).nullable().optional(),
  meta_title: z.string().trim().max(70).nullable().optional(),
  meta_description: z.string().trim().max(170).nullable().optional(),
  published: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(10000).default(0),
}).strict();

export async function GET(_request: Request, context: {params: Promise<{collection: string}>}) {
  try {
    const db = await getAdminApiClient();
    if (!db) return NextResponse.json({error: "No autorizado."}, {status: 401});
    const parsed = collectionSchema.safeParse((await context.params).collection);
    if (!parsed.success) return NextResponse.json({error: "Recurso inválido."}, {status: 404});
    const {data, error} = await db.from(parsed.data).select("*").order("sort_order", {ascending: true}).order("created_at", {ascending: false}).limit(200);
    if (error) return NextResponse.json({error: "No se pudo cargar el contenido."}, {status: 500});
    return NextResponse.json({data: data ?? []});
  } catch {
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}

export async function POST(request: Request, context: {params: Promise<{collection: string}>}) {
  try {
    const db = await getAdminApiClient();
    if (!db) return NextResponse.json({error: "No autorizado."}, {status: 401});
    const parsedCollection = collectionSchema.safeParse((await context.params).collection);
    if (!parsedCollection.success) return NextResponse.json({error: "Recurso inválido."}, {status: 404});
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({error: "JSON inválido."}, {status: 400}); }
    const schema = parsedCollection.data === "projects" ? projectSchema : serviceSchema;
    const parsedBody = schema.safeParse(body);
    if (!parsedBody.success) return NextResponse.json({error: parsedBody.error.issues[0]?.message ?? "Datos inválidos."}, {status: 400});
    const {data, error} = await db.from(parsedCollection.data).insert(parsedBody.data).select("*").single();
    if (error?.code === "23505") return NextResponse.json({error: "Ya existe un contenido con ese slug."}, {status: 409});
    if (error || !data) return NextResponse.json({error: "No se pudo crear el contenido."}, {status: 500});
    return NextResponse.json({data}, {status: 201});
  } catch {
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}
