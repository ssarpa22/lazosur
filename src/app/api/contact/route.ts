import {NextResponse} from "next/server";
import {contactSchema} from "@/lib/contact";
import {checkContactRateLimit} from "@/lib/rate-limit";
import {getDb} from "@/lib/db";

const MAX_BODY_BYTES = 12_000;

async function readJsonBody(request: Request): Promise<
  {ok: true; value: unknown} | {ok: false; tooLarge?: boolean}
> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return {ok: false, tooLarge: true};
  }

  if (!request.body) return {ok: false};

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return {ok: false, tooLarge: true};
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const text = new TextDecoder("utf-8", {fatal: true}).decode(bytes);
    return {ok: true, value: JSON.parse(text) as unknown};
  } catch {
    return {ok: false};
  }
}

export async function POST(request: Request) {
  const rateLimit = await checkContactRateLimit(request);
  if (!rateLimit.allowed) {
    if ("retryAfterSeconds" in rateLimit) {
      return NextResponse.json(
        {error: "Demasiadas solicitudes. Intentá nuevamente más tarde."},
        {
          status: 429,
          headers: {"Retry-After": String(rateLimit.retryAfterSeconds)},
        },
      );
    }

    return NextResponse.json(
      {error: "El formulario no está disponible temporalmente."},
      {status: 503},
    );
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json(
      {error: body.tooLarge ? "Solicitud demasiado grande." : "Solicitud inválida."},
      {status: body.tooLarge ? 413 : 400},
    );
  }

  const parsed = contactSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({error: "Revisá los campos del formulario."}, {status: 400});
  }

  if (parsed.data.website) return NextResponse.json({ok: true});

  try {
    const db = getDb();
    await db`
      INSERT INTO public.leads (
        name, company, email, phone, service, budget, message, consent_at
      ) VALUES (
        ${parsed.data.name},
        ${parsed.data.company || null},
        ${parsed.data.email},
        ${parsed.data.phone || null},
        ${parsed.data.service},
        ${parsed.data.budget || null},
        ${parsed.data.message},
        ${new Date().toISOString()}
      )
    `;
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "unknown";
    console.error("contact_insert_failed", {code});
    return NextResponse.json(
      {error: "No pudimos guardar tu consulta. Intentá más tarde."},
      {status: 500},
    );
  }

  return NextResponse.json({ok: true}, {status: 201});
}
