import {NextResponse} from "next/server";
import {z} from "zod";
import {getAdminApiUser} from "@/lib/admin-api";
import {getDb, getRows, getTransactionRows} from "@/lib/db";

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

type CollectionContext = {params: Promise<{collection: string}>};

export async function GET(_request: Request, context: CollectionContext) {
  try {
    const user = await getAdminApiUser();
    if (!user) return NextResponse.json({error: "No autorizado."}, {status: 401});
    const parsed = collectionSchema.safeParse((await context.params).collection);
    if (!parsed.success) return NextResponse.json({error: "Recurso inválido."}, {status: 404});

    const db = getDb();
    const data = parsed.data === "projects"
      ? await db`
          SELECT * FROM public.projects
          ORDER BY sort_order ASC, created_at DESC
          LIMIT 200
        `
      : await db`
          SELECT * FROM public.services
          ORDER BY sort_order ASC, created_at DESC
          LIMIT 200
        `;
    return NextResponse.json({data});
  } catch {
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}

export async function POST(request: Request, context: CollectionContext) {
  try {
    const user = await getAdminApiUser();
    if (!user) return NextResponse.json({error: "No autorizado."}, {status: 401});
    const parsedCollection = collectionSchema.safeParse((await context.params).collection);
    if (!parsedCollection.success) return NextResponse.json({error: "Recurso inválido."}, {status: 404});

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({error: "JSON inválido."}, {status: 400});
    }

    const db = getDb();
    let result;
    if (parsedCollection.data === "projects") {
      const parsedBody = projectSchema.safeParse(body);
      if (!parsedBody.success) return NextResponse.json({error: parsedBody.error.issues[0]?.message ?? "Datos inválidos."}, {status: 400});
      const p = parsedBody.data;
      result = await db.transaction([
        db`SELECT set_config('app.actor_email', ${user.email}, true)`,
        db`
          INSERT INTO public.projects
            (name, slug, description, category, image_url, gallery, external_url, published, sort_order)
          VALUES
            (${p.name}, ${p.slug}, ${p.description}, ${p.category},
             ${p.image_url || null}, ${p.gallery}, ${p.external_url || null},
             ${p.published}, ${p.sort_order})
          RETURNING *
        `,
      ]);
    } else {
      const parsedBody = serviceSchema.safeParse(body);
      if (!parsedBody.success) return NextResponse.json({error: parsedBody.error.issues[0]?.message ?? "Datos inválidos."}, {status: 400});
      const p = parsedBody.data;
      result = await db.transaction([
        db`SELECT set_config('app.actor_email', ${user.email}, true)`,
        db`
          INSERT INTO public.services
            (name, slug, description, content, meta_title, meta_description, published, sort_order)
          VALUES
            (${p.name}, ${p.slug}, ${p.description}, ${p.content ?? null},
             ${p.meta_title ?? null}, ${p.meta_description ?? null},
             ${p.published}, ${p.sort_order})
          RETURNING *
        `,
      ]);
    }

    const data = getTransactionRows<Record<string, unknown>>(result, 1)[0];
    if (!data) return NextResponse.json({error: "No se pudo crear el contenido."}, {status: 500});
    return NextResponse.json({data}, {status: 201});
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    if (code === "23505") return NextResponse.json({error: "Ya existe un contenido con ese slug."}, {status: 409});
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}
