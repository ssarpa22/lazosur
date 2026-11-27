import {NextResponse} from "next/server";
import {getAdminApiClient} from "@/lib/admin-api";

const statuses = ["new", "contacted", "negotiation", "won", "lost", "archived"] as const;

export async function GET(request: Request) {
  try {
    const db = await getAdminApiClient();
    if (!db) return NextResponse.json({error: "No autorizado."}, {status: 401});

    const params = new URL(request.url).searchParams;
    const rawPage = Number(params.get("page") ?? "1");
    const page = Number.isInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 10000) : 1;
    const rawStatus = params.get("status") ?? "all";
    if (rawStatus !== "all" && !statuses.includes(rawStatus as (typeof statuses)[number])) {
      return NextResponse.json({error: "Filtro de estado inválido."}, {status: 400});
    }

    // Keep PostgREST filter syntax out of user-controlled search terms.
    const search = (params.get("q") ?? "")
      .replace(/[^\p{L}\p{N}\s@.+_-]/gu, " ")
      .trim()
      .slice(0, 80);

    const pageSize = 20;
    let query = db
      .from("leads")
      .select("id,name,company,email,status,created_at", {count: "exact"})
      .order("created_at", {ascending: false})
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (rawStatus !== "all") query = query.eq("status", rawStatus);
    if (search) {
      const term = search.replace(/[.*]/g, " ").trim();
      if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`);
    }

    const {data, error, count} = await query;
    if (error) {
      return NextResponse.json({error: "No se pudieron cargar las consultas."}, {status: 500});
    }

    return NextResponse.json({data: data ?? [], total: count ?? 0, page, pageSize});
  } catch {
    return NextResponse.json({error: "No se pudo completar la solicitud."}, {status: 500});
  }
}
