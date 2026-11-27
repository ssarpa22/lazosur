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

No se necesita ni se expone una clave service_role. Crear el primer usuario manualmente desde Supabase Auth y agregar su correo a ADMIN_EMAILS. No hay registro público de administradores.

## Base de datos
Aplicar `supabase/migrations/202611270001_initial_lazo_sur.sql` en Supabase SQL Editor o con Supabase CLI. RLS está habilitada. Leads, ajustes y auditoría no tienen políticas públicas; portfolio y servicios solo permiten lectura de registros publicados.

## Comandos
`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Pendientes explícitos antes de producción
El formulario persiste consultas solo cuando Supabase está configurado; sin credenciales responde 503 y no simula guardado. El honeypot no reemplaza rate limiting distribuido: configurar un proveedor antes de publicar el formulario. El panel inicial autentica administradores y muestra métricas reales básicas; aún falta CRUD completo de leads/proyectos/servicios/configuración, auditoría conectada a mutaciones, notificaciones por correo y pruebas E2E/RLS. No se inventaron datos de contacto, precios, testimonios ni métricas.

CI no despliega a Vercel. Revisar el PR antes de merge y configurar Vercel/Supabase manualmente.