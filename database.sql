-- Supabase SQL Schema for Orion Steam Library

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Games Table
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT NOT NULL,
    steam_username TEXT NOT NULL,
    steam_password TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL, -- legacy
    category_ids UUID[] DEFAULT '{}',
    price DECIMAL(10, 2) DEFAULT 0.00,
    images TEXT[] DEFAULT '{}',
    requirements TEXT,
    is_highlight BOOLEAN DEFAULT false,
    highlight_text TEXT DEFAULT 'Garantia Vitalícia',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.1 Create Game Categories Junction Table
CREATE TABLE IF NOT EXISTS public.game_categories (
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, category_id)
);

-- 4. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Logs Table
CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Trigger to create a profile automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, 'user');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Row Level Security (RLS) setup

-- Create a secure function to check admin status bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Categories: Anyone can read, only admin can write
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.is_admin());

-- Games: Anyone can read games.
CREATE POLICY "Games are viewable by everyone" ON public.games FOR SELECT USING (true);
CREATE POLICY "Admins can insert games" ON public.games FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update games" ON public.games FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete games" ON public.games FOR DELETE USING (public.is_admin());

-- Profiles: Users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (public.is_admin());

-- Logs: Admins can read all, anyone authenticated can insert
CREATE POLICY "Admins can view all logs" ON public.logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Authenticated users can insert logs" ON public.logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, game_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Enable realtime for notifications
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 10. Seed some initial data
INSERT INTO public.categories (name, slug) VALUES 
('Lançamentos', 'lancamentos'),
('Ação', 'acao'),
('Aventura', 'aventura'),
('RPG', 'rpg')
ON CONFLICT (slug) DO NOTHING;
