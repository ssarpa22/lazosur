# Lazo Sur

Sitio comercial y base de plataforma administrativa para un estudio digital enfocado en diseño/desarrollo web y posicionamiento SEO.

## Stack
Next.js App Router, React, TypeScript, Supabase Auth/PostgreSQL/RLS, Zod, Vitest y Upstash Redis REST para rate limiting distribuido.

## Desarrollo local
Requiere Node.js 22+. Ejecutar `npm ci`, copiar `.env.example` a `.env.local` y correr `npm run dev`.

## Variables
- `NEXT_PUBLIC_SITE_URL`: URL canónica del sitio.
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`: credenciales públicas del proyecto Supabase.
- `ADMIN_EMAILS`: allowlist de administradores, exclusivamente del lado servidor.
- `SUPABASE_SERVICE_ROLE_KEY`: clave privilegiada de Supabase, exclusivamente del lado servidor y usada solo por el endpoint de contacto.
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`: credenciales REST de Upstash, exclusivamente del lado servidor.

**Nunca** prefijar las claves de servicio con `NEXT_PUBLIC_`, incluirlas en el cliente, registrarlas en logs ni compartirlas en el repositorio.

## Supabase y primer administrador
1. Crear un proyecto Supabase y ejecutar las migraciones en orden desde `supabase/migrations`.
2. Crear el usuario inicial manualmente desde Authentication > Users.
3. En la ficha del usuario, asignar en **app_metadata** el claim `role: admin` (nunca en `user_metadata`, que es editable por el usuario).
4. Agregar el mismo correo a `ADMIN_EMAILS` en el entorno de servidor.
5. Configurar las URL permitidas de Auth para local y producción.

La autorización de la aplicación exige ambas condiciones: el correo debe estar en la allowlist del servidor y el usuario autenticado debe tener el claim confiable `app_metadata.role=admin`. PostgreSQL aplica el claim mediante RLS; las rutas de servidor aplican además la allowlist. Retirar un correo de `ADMIN_EMAILS` bloquea el acceso a la aplicación aunque el claim siga presente. No habilitar registro público de administradores.

## Seguridad del formulario y auditoría
El endpoint valida los datos en servidor con Zod, limita el cuerpo HTTP a 12 KB incluso cuando no se informa `Content-Length`, y utiliza un honeypot. Los leads se insertan con una clave service role solo desde el servidor. Las migraciones revocan los permisos de inserción de `anon` y `authenticated`, por lo que no es posible saltarse el rate limit llamando directamente a la API REST de Supabase. La clave privilegiada nunca se envía al navegador.

El rate limiting usa Upstash Redis con una operación Lua atómica: **5 solicitudes por IP cada 10 minutos**. Las IP se identifican mediante `x-real-ip` proporcionado por la plataforma de hosting y se guardan en Redis como hash SHA-256, no como IP en texto plano. En producción, si faltan las credenciales de Upstash o no se puede verificar la IP, el endpoint falla cerrado (503) en lugar de desactivar silenciosamente la protección. En desarrollo local, el límite se omite si Upstash no está configurado.

Las modificaciones de leads, proyectos, servicios y configuración generan entradas en `admin_audit_log` mediante triggers de PostgreSQL. Los roles de aplicación no pueden insertar, modificar ni borrar entradas de auditoría directamente. Los registros guardan la identidad del JWT y el tipo de operación, sin copiar el contenido sensible de las filas.

## Comandos
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npx supabase test db` para las pruebas SQL de RLS y privilegios (con el stack local iniciado).

## Pendientes explícitos antes de producción
Antes de publicar, crear una base Redis en Upstash y configurar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` en local y en el entorno de producción de Vercel. Configurar también `SUPABASE_SERVICE_ROLE_KEY` en Vercel como variable server-only. El panel autentica administradores y muestra métricas reales básicas; aún falta CRUD completo de leads/proyectos/servicios/configuración, notificaciones por correo y pruebas E2E de flujos autenticados. No se inventaron datos de contacto, precios, testimonios ni métricas.

CI no despliega a Vercel. Revisar el PR antes de merge y configurar Vercel/Supabase manualmente.
