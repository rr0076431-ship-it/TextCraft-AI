-- TextCraft-AI Supabase schema
-- Safe baseline for a fresh Supabase project. RLS + explicit grants are used
-- together; do not put Supabase service-role keys in browser-side environment vars.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  daily_limit integer NOT NULL DEFAULT 20 CHECK (daily_limit >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_slug text NOT NULL,
  tool_name text NOT NULL,
  input_text text NOT NULL,
  output_text text NOT NULL,
  tone text,
  language text,
  thinking_mode boolean NOT NULL DEFAULT false,
  model_used text NOT NULL DEFAULT 'gemini-4-argon',
  word_count integer NOT NULL DEFAULT 0 CHECK (word_count >= 0),
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_ip text,
  tool_slug text NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  count integer NOT NULL DEFAULT 1 CHECK (count >= 0),
  CONSTRAINT unique_user_daily_tool UNIQUE (user_id, tool_slug, usage_date),
  CONSTRAINT unique_guest_daily_tool UNIQUE (guest_ip, tool_slug, usage_date),
  CONSTRAINT daily_usage_has_actor CHECK (user_id IS NOT NULL OR guest_ip IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.tool_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug text UNIQUE NOT NULL,
  name text NOT NULL,
  total_uses integer NOT NULL DEFAULT 0 CHECK (total_uses >= 0),
  today_uses integer NOT NULL DEFAULT 0 CHECK (today_uses >= 0),
  last_reset_date date NOT NULL DEFAULT CURRENT_DATE,
  is_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generations_user_created_at_idx
  ON public.generations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS daily_usage_user_date_idx
  ON public.daily_usage (user_id, usage_date DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS daily_usage_guest_date_idx
  ON public.daily_usage (guest_ip, usage_date DESC) WHERE guest_ip IS NOT NULL;

-- Role helper avoids recursive RLS policies. Kept outside exposed schemas.
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

-- New signups are always regular users. Do not trust client-editable user metadata for roles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, daily_limit)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    'user',
    20
  );
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Explicit grants: RLS policies alone do not remove PostgreSQL table privileges.
REVOKE ALL ON TABLE public.profiles, public.generations, public.daily_usage, public.tool_stats
  FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.profiles, public.generations, public.daily_usage, public.tool_stats
  TO service_role;

GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.generations TO authenticated;
GRANT SELECT ON public.daily_usage TO authenticated;

GRANT SELECT ON public.tool_stats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_stats TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_admin
  ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

DROP POLICY IF EXISTS profiles_update_name_own_or_admin ON public.profiles;
CREATE POLICY profiles_update_name_own_or_admin
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()) OR (SELECT private.is_admin()))
  WITH CHECK (id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

DROP POLICY IF EXISTS generations_select_own_or_admin ON public.generations;
CREATE POLICY generations_select_own_or_admin
  ON public.generations FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

DROP POLICY IF EXISTS generations_insert_own ON public.generations;
CREATE POLICY generations_insert_own
  ON public.generations FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS generations_update_own_or_admin ON public.generations;
CREATE POLICY generations_update_own_or_admin
  ON public.generations FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_admin()))
  WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

DROP POLICY IF EXISTS generations_delete_own_or_admin ON public.generations;
CREATE POLICY generations_delete_own_or_admin
  ON public.generations FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

DROP POLICY IF EXISTS daily_usage_select_own_or_admin ON public.daily_usage;
CREATE POLICY daily_usage_select_own_or_admin
  ON public.daily_usage FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

-- Keep the public policy independent of private.is_admin(): anon must not need
-- permission to execute an admin helper just to read enabled tools.
DROP POLICY IF EXISTS tool_stats_read_enabled_anon ON public.tool_stats;
CREATE POLICY tool_stats_read_enabled_anon
  ON public.tool_stats FOR SELECT TO anon
  USING (is_enabled = true);

DROP POLICY IF EXISTS tool_stats_read_enabled_or_admin ON public.tool_stats;
CREATE POLICY tool_stats_read_enabled_or_admin
  ON public.tool_stats FOR SELECT TO authenticated
  USING (is_enabled = true OR (SELECT private.is_admin()));

DROP POLICY IF EXISTS tool_stats_insert_admin ON public.tool_stats;
CREATE POLICY tool_stats_insert_admin
  ON public.tool_stats FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.is_admin()));

DROP POLICY IF EXISTS tool_stats_update_admin ON public.tool_stats;
CREATE POLICY tool_stats_update_admin
  ON public.tool_stats FOR UPDATE TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

DROP POLICY IF EXISTS tool_stats_delete_admin ON public.tool_stats;
CREATE POLICY tool_stats_delete_admin
  ON public.tool_stats FOR DELETE TO authenticated
  USING ((SELECT private.is_admin()));

-- Server-only counter RPC; browser clients cannot forge usage statistics.
CREATE OR REPLACE FUNCTION public.increment_tool_stat(p_slug text, p_tool_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.tool_stats (tool_slug, name, total_uses, today_uses, is_enabled)
  VALUES (p_slug, p_tool_name, 1, 1, true)
  ON CONFLICT (tool_slug) DO UPDATE
    SET total_uses = public.tool_stats.total_uses + 1,
        today_uses = CASE
          WHEN public.tool_stats.last_reset_date = CURRENT_DATE
          THEN public.tool_stats.today_uses + 1
          ELSE 1
        END,
        last_reset_date = CURRENT_DATE,
        updated_at = now();
END;
$$;
REVOKE ALL ON FUNCTION public.increment_tool_stat(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_tool_stat(text, text) TO service_role;

INSERT INTO public.tool_stats (tool_slug, name, total_uses, today_uses, is_enabled) VALUES
  ('article-writer', 'Article Writer', 0, 0, true),
  ('paraphraser', 'Paraphraser', 0, 0, true),
  ('summarizer', 'Summarizer', 0, 0, true),
  ('grammar-checker', 'Grammar Checker', 0, 0, true),
  ('email-writer', 'Email Writer', 0, 0, true),
  ('caption-writer', 'Social Media Caption', 0, 0, true),
  ('product-description', 'Product Description', 0, 0, true),
  ('story-writer', 'Story Writer', 0, 0, true),
  ('translator', 'Text Translator', 0, 0, true),
  ('seo-meta-writer', 'SEO Meta Writer', 0, 0, true)
ON CONFLICT (tool_slug) DO NOTHING;

COMMENT ON TABLE public.profiles IS 'User profiles. Role is managed by trusted server/admin operations and is not client-updatable.';
COMMENT ON TABLE public.generations IS 'Saved text generations. Authenticated users can access only their own records, unless admin.';
COMMENT ON TABLE public.daily_usage IS 'Usage enforcement counters. Client roles can read but cannot modify usage records.';
COMMENT ON TABLE public.tool_stats IS 'Tool usage totals and enable state. Public reads are limited to enabled tools.';
