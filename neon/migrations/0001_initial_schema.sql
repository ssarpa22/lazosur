BEGIN;

-- =========================================================
-- 1. EXTENSIONS
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 2. TABLES
-- =========================================================

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  company text,
  email text NOT NULL CHECK (char_length(email) <= 254),
  phone text,
  service text NOT NULL CHECK (service IN ('web', 'seo', 'both', 'other')),
  budget text,
  message text NOT NULL CHECK (char_length(message) BETWEEN 20 AND 4000),
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'negotiation', 'won', 'lost', 'archived')),
  source text NOT NULL DEFAULT 'website',
  consent_at timestamptz NOT NULL,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text NOT NULL,
  category text NOT NULL DEFAULT 'Proyecto propio',
  image_url text,
  gallery text[] NOT NULL DEFAULT '{}',
  external_url text,
  published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text NOT NULL,
  content text,
  meta_title text,
  meta_description text,
  published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  business_name text NOT NULL DEFAULT 'Lazo Sur',
  description text,
  contact_email text,
  phone text,
  whatsapp text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  canonical_url text,
  seo_title text,
  seo_description text,
  og_image text,
  footer_text text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text NOT NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- 3. INDEXES
-- =========================================================

CREATE INDEX leads_status_created_at_idx
  ON public.leads (status, created_at DESC);

CREATE INDEX leads_created_at_idx
  ON public.leads (created_at DESC);

CREATE INDEX projects_published_sort_order_idx
  ON public.projects (sort_order, created_at DESC)
  WHERE published = true;

CREATE INDEX services_published_sort_order_idx
  ON public.services (sort_order, created_at DESC)
  WHERE published = true;

-- =========================================================
-- 4. UPDATED_AT TRIGGER
-- =========================================================

CREATE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;

CREATE TRIGGER leads_set_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER projects_set_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER services_set_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER site_settings_set_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- 5. AUDIT LOG
-- =========================================================
-- The application sets app.actor_email inside each write
-- transaction. If no actor is supplied, the operation is
-- recorded as system (e.g. public contact submissions).
--
-- This function does not depend on Supabase JWT or auth.jwt().

CREATE FUNCTION public.audit_admin_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  changed_row jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    changed_row := pg_catalog.to_jsonb(OLD);
  ELSE
    changed_row := pg_catalog.to_jsonb(NEW);
  END IF;

  INSERT INTO public.admin_audit_log (
    actor_email,
    action,
    entity,
    entity_id,
    metadata
  )
  VALUES (
    COALESCE(
      NULLIF(pg_catalog.current_setting('app.actor_email', true), ''),
      'system'
    ),
    pg_catalog.lower(TG_OP),
    TG_TABLE_NAME,
    changed_row ->> 'id',
    pg_catalog.jsonb_build_object('operation', TG_OP)
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_admin_mutation() FROM PUBLIC;

CREATE TRIGGER leads_audit_mutation
AFTER INSERT OR UPDATE OR DELETE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.audit_admin_mutation();

CREATE TRIGGER projects_audit_mutation
AFTER INSERT OR UPDATE OR DELETE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.audit_admin_mutation();

CREATE TRIGGER services_audit_mutation
AFTER INSERT OR UPDATE OR DELETE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.audit_admin_mutation();

CREATE TRIGGER site_settings_audit_mutation
AFTER INSERT OR UPDATE OR DELETE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.audit_admin_mutation();

-- =========================================================
-- 6. INITIAL PROJECTS
-- =========================================================

INSERT INTO public.projects (
  name, slug, description, category, published, sort_order
)
VALUES
(
  U&'M\00E9tricaSur',
  'metricasur',
  U&'Proyecto propio de software de gesti\00F3n y anal\00EDtica empresarial.',
  'Proyecto propio',
  true,
  1
),
(
  'RadioEterna',
  'radioeterna',
  'Proyecto digital propio de Lazo Sur.',
  'Proyecto propio',
  true,
  2
);

-- =========================================================
-- 7. INITIAL SERVICES
-- =========================================================

INSERT INTO public.services (
  name, slug, description, published, sort_order
)
VALUES
(
  U&'Dise\00F1o y desarrollo web',
  'desarrollo-web',
  'Sitios institucionales, landing pages y desarrollos a medida.',
  true,
  1
),
(
  'Posicionamiento SEO',
  'seo',
  U&'Auditor\00EDa, SEO t\00E9cnico, contenidos y estrategia org\00E1nica.',
  true,
  2
);

COMMIT;
