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
3. En la ficha del usuario, asignar en **app_metadata** el claim `role: admin` (nunca en `user_metadata`, que es editable por el usuario).
4. Agregar el mismo correo a `ADMIN_EMAILS` en el entorno de servidor.
5. Configurar las URL permitidas de Auth para local y producción.

La autorización de la aplicación exige ambas condiciones: el correo debe estar en la allowlist del servidor y el usuario autenticado debe tener el claim confiable `app_metadata.role=admin`. PostgreSQL aplica el claim mediante RLS; las rutas de servidor aplican además la allowlist. Retirar un correo de `ADMIN_EMAILS` bloquea el acceso a la aplicación aunque el claim siga presente. No habilitar registro público de administradores.

## Seguridad del formulario y auditoría
El endpoint valida los datos en servidor con Zod, limita el cuerpo HTTP a 12 KB incluso cuando no se informa `Content-Length`, y utiliza un honeypot. La política RLS pública permite insertar únicamente los campos del formulario; el estado y el origen se establecen mediante valores predeterminados. Los visitantes no pueden leer leads ni sus notas internas.

Las modificaciones de leads, proyectos, servicios y configuración generan entradas en `admin_audit_log` mediante triggers de PostgreSQL. Los roles de aplicación no pueden insertar, modificar ni borrar entradas de auditoría directamente. Los registros guardan la identidad del JWT y el tipo de operación, sin copiar el contenido sensible de las filas.

El rate limiting distribuido todavía debe configurarse antes de lanzar el formulario públicamente: el honeypot y el límite de tamaño no sustituyen un control de frecuencia.

## Comandos
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npx supabase test db` para las pruebas SQL de RLS y privilegios (con el stack local iniciado).

## Pendientes explícitos antes de producción
El formulario persiste consultas solo cuando Supabase está configurado; sin credenciales responde 503 y no simula guardado. El panel autentica administradores y muestra métricas reales básicas; aún falta CRUD completo de leads/proyectos/servicios/configuración, notificaciones por correo y rate limiting distribuido. Las pruebas SQL de esta etapa verifican privilegios, RLS y triggers; todavía se necesitan pruebas E2E de flujos autenticados. No se inventaron datos de contacto, precios, testimonios ni métricas.

CI no despliega a Vercel. Revisar el PR antes de merge y configurar Vercel/Supabase manualmente.
