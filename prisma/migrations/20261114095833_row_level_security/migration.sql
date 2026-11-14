-- Row-level security per organisation.
--
-- The app connects at runtime as a NON-owner role (aalim_app), so these
-- policies are enforced for every query it makes. Each request runs inside a
-- transaction that sets two local settings:
--   app.org_id  – the organisation the person is acting in (may be empty)
--   app.user_id – the signed-in person (may be empty)
-- Trusted system tasks (migrations, seeding, background jobs, AI call logging)
-- use the owner connection, which bypasses RLS because the policies are not
-- FORCEd. See docs/architecture.md → "Tenancy and row-level security".

CREATE OR REPLACE FUNCTION app_org() RETURNS text
  LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.org_id', true), '') $$;
CREATE OR REPLACE FUNCTION app_user() RETURNS text
  LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.user_id', true), '') $$;

-- Organisation: visible when it is the active org or the person is a member.
ALTER TABLE "organization" ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_visible ON "organization" FOR SELECT
  USING (id = app_org() OR EXISTS (SELECT 1 FROM "membership" m WHERE m."organizationId" = "organization".id AND m."userId" = app_user()));
CREATE POLICY org_update ON "organization" FOR UPDATE
  USING (id = app_org()) WITH CHECK (id = app_org());

-- Membership: the active org's members, plus your own memberships everywhere.
ALTER TABLE "membership" ENABLE ROW LEVEL SECURITY;
CREATE POLICY membership_read ON "membership" FOR SELECT
  USING ("organizationId" = app_org() OR "userId" = app_user());
CREATE POLICY membership_write ON "membership" FOR ALL
  USING ("organizationId" = app_org()) WITH CHECK ("organizationId" = app_org());

-- Org-only tables.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['assessment_template','template_skill_weight','invitation','team','audit_log'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I FOR ALL USING ("organizationId" = app_org()) WITH CHECK ("organizationId" = app_org())', t);
  END LOOP;
END $$;

-- Team members: the org, plus the member themselves (to see and give consent).
ALTER TABLE "team_member" ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_member_org ON "team_member" FOR ALL
  USING ("organizationId" = app_org()) WITH CHECK ("organizationId" = app_org());
CREATE POLICY team_member_self ON "team_member" FOR SELECT USING ("userId" = app_user());
CREATE POLICY team_member_self_update ON "team_member" FOR UPDATE
  USING ("userId" = app_user()) WITH CHECK ("userId" = app_user());

-- Assessment data: visible to the owning org or to the person assessed.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['assessment_session','scenario_world','item','response','item_score',
                           'candidate_model_snapshot','hypothesis','report','report_share_link','integrity_event'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($p$CREATE POLICY org_or_subject ON %I FOR ALL
      USING (("organizationId" IS NOT NULL AND "organizationId" = app_org()) OR ("subjectUserId" IS NOT NULL AND "subjectUserId" = app_user()))
      WITH CHECK (("organizationId" IS NOT NULL AND "organizationId" = app_org()) OR ("subjectUserId" IS NOT NULL AND "subjectUserId" = app_user()))$p$, t);
  END LOOP;
END $$;

-- Framework and tracks: built-in rows (organizationId IS NULL) are readable by
-- everyone; org rows only by that org. Built-in rows are written by the owner.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['competency_domain','competency','track'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY read_builtin_or_org ON %I FOR SELECT USING ("organizationId" IS NULL OR "organizationId" = app_org())', t);
    EXECUTE format('CREATE POLICY write_org ON %I FOR INSERT WITH CHECK ("organizationId" = app_org())', t);
    EXECUTE format('CREATE POLICY update_org ON %I FOR UPDATE USING ("organizationId" = app_org()) WITH CHECK ("organizationId" = app_org())', t);
    EXECUTE format('CREATE POLICY delete_org ON %I FOR DELETE USING ("organizationId" = app_org())', t);
  END LOOP;
END $$;

-- Grow data is private to the individual.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['development_plan','practice_session','track_enrollment'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY owner_only ON %I FOR ALL USING ("userId" = app_user()) WITH CHECK ("userId" = app_user())', t);
  END LOOP;
END $$;

-- Consent: the person's own records, or the org that collected them.
ALTER TABLE "consent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY consent_access ON "consent" FOR ALL
  USING ("userId" = app_user() OR ("organizationId" IS NOT NULL AND "organizationId" = app_org()))
  WITH CHECK ("userId" = app_user() OR ("organizationId" IS NOT NULL AND "organizationId" = app_org()));

-- AI call log: system only. RLS on, no policies → the app role sees nothing.
ALTER TABLE "ai_call_log" ENABLE ROW LEVEL SECURITY;

-- Grants for the runtime role, if it exists in this cluster.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'aalim_app') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA public TO aalim_app';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO aalim_app';
    IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
      EXECUTE 'REVOKE ALL ON "_prisma_migrations" FROM aalim_app';
    END IF;
    EXECUTE 'GRANT EXECUTE ON FUNCTION app_org(), app_user() TO aalim_app';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO aalim_app';
  END IF;
END $$;
