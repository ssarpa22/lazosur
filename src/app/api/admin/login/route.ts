import {NextResponse} from "next/server";
import {z} from "zod";
import {createClient} from "@/lib/supabase/server";
import {isAdmin} from "@/lib/auth";

const schema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: "Solicitud inválida."}, {status: 400});
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({error: "Completá correo y contraseña."}, {status: 400});
  }

  if (!(process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(parsed.data.email.toLowerCase())) {
    return NextResponse.json({error: "Credenciales no autorizadas."}, {status: 403});
  }

  try {
    const db = await createClient();
    const {error} = await db.auth.signInWithPassword(parsed.data);
    if (error) {
      return NextResponse.json({error: "Credenciales incorrectas."}, {status: 401});
    }

    // A valid password is not sufficient: the trusted app_metadata claim is
    // assigned out-of-band by the project owner and must also be present.
    const {data, error: userError} = await db.auth.getUser();
    if (userError || !data.user || !isAdmin(data.user.email, data.user.app_metadata)) {
      await db.auth.signOut();
      return NextResponse.json({error: "La cuenta no tiene permisos administrativos."}, {status: 403});
    }

    return NextResponse.json({ok: true});
  } catch {
    return NextResponse.json({error: "El acceso administrativo no está configurado."}, {status: 503});
  }
}
