import {NextResponse} from "next/server";
import {z} from "zod";
import {getAdminApiUser} from "@/lib/admin-api";
import {getDb, getRows, getTransactionRows} from "@/lib/db";

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
    const user = await getAdminApiUser();
    if (!user) return NextResponse.json({error: "No autorizado."}, {status: 401});
    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) return NextResponse.json({error: "Contenido inválido."}, {status: 400});

    const db = getDb();
    const rows = parsed.data.collection === "projects"
      ? await db`SELECT * FROM public.projects WHERE id = ${parsed.data.id} LIMIT 1`
      : await db`SELECT * FROM public.services WHERE id = ${parsed.data.id} LIMIT 1`;
    const data = getRows<Record<string, unknown>>(rows)[0];
    if (!data) return NextResponse.json({error: "El contenido no existe."}, {status: 404});
    return NextResponse.json({data});
  } catch {
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getAdminApiUser();
    if (!user) return NextResponse.json({error: "No autorizado."}, {status: 401});
    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) return NextResponse.json({error: "Contenido inválido."}, {status: 400});

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({error: "JSON inválido."}, {status: 400});
    }

    const db = getDb();
    let result;
    if (parsed.data.collection === "projects") {
      const parsedBody = projectSchema.safeParse(body);
      if (!parsedBody.success || Object.keys(parsedBody.data ?? {}).length === 0) {
        return NextResponse.json({error: parsedBody.success ? "No hay cambios para guardar." : parsedBody.error.issues[0]?.message ?? "Datos inválidos."}, {status: 400});
      }
      const p = parsedBody.data;
      result = await db.transaction([
        db`SELECT set_config('app.actor_email', ${user.email}, true)`,
        db`
          UPDATE public.projects SET
            name = CASE WHEN ${p.name !== undefined} THEN ${p.name ?? null} ELSE name END,
            slug = CASE WHEN ${p.slug !== undefined} THEN ${p.slug ?? null} ELSE slug END,
            description = CASE WHEN ${p.description !== undefined} THEN ${p.description ?? null} ELSE description END,
            category = CASE WHEN ${p.category !== undefined} THEN ${p.category ?? null} ELSE category END,
            image_url = CASE WHEN ${p.image_url !== undefined} THEN ${p.image_url ?? null} ELSE image_url END,
            gallery = CASE WHEN ${p.gallery !== undefined} THEN ${p.gallery ?? []} ELSE gallery END,
            external_url = CASE WHEN ${p.external_url !== undefined} THEN ${p.external_url ?? null} ELSE external_url END,
            published = CASE WHEN ${p.published !== undefined} THEN ${p.published ?? false} ELSE published END,
            sort_order = CASE WHEN ${p.sort_order !== undefined} THEN ${p.sort_order ?? 0} ELSE sort_order END
          WHERE id = ${parsed.data.id}
          RETURNING *
        `,
      ]);
    } else {
      const parsedBody = serviceSchema.safeParse(body);
      if (!parsedBody.success || Object.keys(parsedBody.data ?? {}).length === 0) {
        return NextResponse.json({error: parsedBody.success ? "No hay cambios para guardar." : parsedBody.error.issues[0]?.message ?? "Datos inválidos."}, {status: 400});
      }
      const p = parsedBody.data;
      result = await db.transaction([
        db`SELECT set_config('app.actor_email', ${user.email}, true)`,
        db`
          UPDATE public.services SET
            name = CASE WHEN ${p.name !== undefined} THEN ${p.name ?? null} ELSE name END,
            slug = CASE WHEN ${p.slug !== undefined} THEN ${p.slug ?? null} ELSE slug END,
            description = CASE WHEN ${p.description !== undefined} THEN ${p.description ?? null} ELSE description END,
            content = CASE WHEN ${p.content !== undefined} THEN ${p.content ?? null} ELSE content END,
            meta_title = CASE WHEN ${p.meta_title !== undefined} THEN ${p.meta_title ?? null} ELSE meta_title END,
            meta_description = CASE WHEN ${p.meta_description !== undefined} THEN ${p.meta_description ?? null} ELSE meta_description END,
            published = CASE WHEN ${p.published !== undefined} THEN ${p.published ?? false} ELSE published END,
            sort_order = CASE WHEN ${p.sort_order !== undefined} THEN ${p.sort_order ?? 0} ELSE sort_order END
          WHERE id = ${parsed.data.id}
          RETURNING *
        `,
      ]);
    }

    const data = getTransactionRows<Record<string, unknown>>(result, 1)[0];
    if (!data) return NextResponse.json({error: "El contenido no existe."}, {status: 404});
    return NextResponse.json({data});
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    if (code === "23505") return NextResponse.json({error: "Ya existe un contenido con ese slug."}, {status: 409});
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}
