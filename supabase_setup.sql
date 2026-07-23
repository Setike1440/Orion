-- ====================================================================
-- SCRIPT SQL COMPLETO PARA CONFIGURAÇÃO DO SUPABASE (DEPLOY VERCEL)
-- Execute este script no Editor SQL do seu projeto no Supabase
-- ====================================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile or admins can update any" ON public.profiles;
CREATE POLICY "Users can update own profile or admins can update any" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (true);

-- Trigger para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Tabela de Categorias (categories)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Tabela de Jogos (games)
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT NOT NULL,
  steam_username TEXT NOT NULL,
  steam_password TEXT NOT NULL,
  requirements TEXT,
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_ids TEXT[] DEFAULT '{}',
  is_highlight BOOLEAN DEFAULT false,
  is_most_played BOOLEAN DEFAULT false,
  admin_highlight_game BOOLEAN DEFAULT false,
  highlight_text TEXT DEFAULT 'Jogue Agora',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Games viewable by everyone" ON public.games;
CREATE POLICY "Games viewable by everyone" ON public.games FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert games" ON public.games;
CREATE POLICY "Admins can insert games" ON public.games FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update games" ON public.games;
CREATE POLICY "Admins can update games" ON public.games FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete games" ON public.games;
CREATE POLICY "Admins can delete games" ON public.games FOR DELETE USING (true);

-- 5. Tabela de Favoritos (favorites)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own favorites" ON public.favorites;
CREATE POLICY "Users view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own favorites" ON public.favorites;
CREATE POLICY "Users insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own favorites" ON public.favorites;
CREATE POLICY "Users delete own favorites" ON public.favorites FOR DELETE USING (true);

-- 6. Tabela de Logs (logs)
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Logs viewable by admins" ON public.logs;
CREATE POLICY "Logs viewable by admins" ON public.logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert logs" ON public.logs;
CREATE POLICY "Anyone can insert logs" ON public.logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete logs" ON public.logs;
CREATE POLICY "Admins can delete logs" ON public.logs FOR DELETE USING (true);

-- 7. Tabela de Notificações (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications viewable by everyone" ON public.notifications;
CREATE POLICY "Notifications viewable by everyone" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins insert notifications" ON public.notifications;
CREATE POLICY "Admins insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
