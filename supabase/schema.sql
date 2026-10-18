-- ========================================================
-- TextCraft AI — Supabase Database Schema
-- ========================================================

-- 1. Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  daily_limit INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger: auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, daily_limit)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user',
    20
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Table: generations
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tool_slug TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  tone TEXT,
  language TEXT,
  thinking_mode BOOLEAN DEFAULT FALSE,
  model_used TEXT DEFAULT 'gemini-4-argon',
  word_count INT DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for generations
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own generations (favorites)"
  ON public.generations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all generations"
  ON public.generations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Table: daily_usage
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_ip TEXT,
  tool_slug TEXT NOT NULL,
  usage_date DATE DEFAULT CURRENT_DATE,
  count INT DEFAULT 1,
  CONSTRAINT unique_user_daily_tool UNIQUE (user_id, tool_slug, usage_date),
  CONSTRAINT unique_guest_daily_tool UNIQUE (guest_ip, tool_slug, usage_date)
);

ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read/update own daily usage"
  ON public.daily_usage FOR ALL
  USING (auth.uid() = user_id);

-- 4. Table: tool_stats
CREATE TABLE IF NOT EXISTS public.tool_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  total_uses INT DEFAULT 0,
  today_uses INT DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  is_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tool_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read enabled tools"
  ON public.tool_stats FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can modify tool stats"
  ON public.tool_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function: increment_tool_stat
CREATE OR REPLACE FUNCTION increment_tool_stat(slug TEXT, tool_name TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.tool_stats (tool_slug, name, total_uses, today_uses, is_enabled)
  VALUES (slug, tool_name, 1, 1, true)
  ON CONFLICT (tool_slug) DO UPDATE
  SET total_uses = tool_stats.total_uses + 1,
      today_uses = tool_stats.today_uses + 1,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Seed initial tool_stats data
INSERT INTO public.tool_stats (tool_slug, name, total_uses, today_uses, is_enabled) VALUES
  ('article-writer', 'Article Writer', 1420, 43, true),
  ('paraphraser', 'Paraphraser', 980, 31, true),
  ('summarizer', 'Summarizer', 856, 29, true),
  ('grammar-checker', 'Grammar Checker', 1120, 38, true),
  ('email-writer', 'Email Writer', 640, 19, true),
  ('caption-writer', 'Social Media Caption', 530, 14, true),
  ('product-description', 'Product Description', 410, 12, true),
  ('story-writer', 'Story Writer', 390, 15, true),
  ('translator', 'Text Translator', 780, 22, true),
  ('seo-meta-writer', 'SEO Meta Writer', 360, 9, true)
ON CONFLICT (tool_slug) DO NOTHING;
