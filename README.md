# Lazo Sur

Sitio comercial y base de plataforma administrativa para un estudio digital enfocado en diseño/desarrollo web y posicionamiento SEO.

## Stack
Next.js App Router, React, TypeScript, Supabase Auth/PostgreSQL/RLS, Zod y Vitest.

## Desarrollo local
Requiere Node.js 22+. Ejecutar `npm install`, copiar `.env.example` a `.env.local` y correr `npm run dev`.

## Variables
- `NEXT_PUBLIC_SITE_URL`: URL canónica del sitio.
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`: credenciales públicas del proyecto Supabase.
- `ADMIN_EMAILS`: allowlist de administradores, exclusivamente del lado servidor.

No se necesita ni se expone una clave service_role. No hay registro público de administradores.

## Supabase y primer administrador
1. Crear un proyecto Supabase y ejecutar las migraciones en orden desde `supabase/migrations`.
2. Crear el usuario inicial manualmente desde Authentication > Users.
3. En la ficha del usuario, asignar en **app_metadata** el claim `role: admin` (nunca en user_metadata editable por el usuario).
4. Agregar el mismo correo a `ADMIN_EMAILS` en el entorno de servidor.
5. Configurar las URL permitidas de Auth para local y producción.

La autorización requiere ambas condiciones: allowlist del servidor y claim confiable `app_metadata.role=admin`. RLS aplica ese claim en PostgreSQL. No habilitar registro público de administradores.

## Seguridad del formulario
El endpoint valida en servidor con Zod, limita el tamaño de la solicitud y utiliza un honeypot. La política RLS pública permite únicamente INSERT de leads con estado inicial y sin notas internas; no permite lectura. El rate limiting distribuido todavía debe configurarse antes de lanzar el formulario públicamente: el honeypot no es sustituto.

## Comandos
`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Pendientes explícitos antes de producción
El formulario persiste consultas solo cuando Supabase está configurado; sin credenciales responde 503 y no simula guardado. El panel autentica administradores y muestra métricas reales básicas; aún falta CRUD completo de leads/proyectos/servicios/configuración, auditoría conectada a mutaciones, notificaciones por correo y pruebas E2E/RLS. No se inventaron datos de contacto, precios, testimonios ni métricas.

CI no despliega a Vercel. Revisar el PR antes de merge y configurar Vercel/Supabase manualmente.
