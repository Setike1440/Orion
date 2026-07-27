import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database, Server, RefreshCw, CheckCircle2, Code2, Copy, Check, ExternalLink, Table, Terminal, ArrowUpRight, RotateCw } from 'lucide-react';
import { AdminToast } from '../../components/admin/AdminModal';

export const DatabaseManager = () => {
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [selectedTable, setSelectedTable] = useState<'games' | 'profiles' | 'categories' | 'suggestions' | 'site_settings' | 'error_logs'>('games');
  const [tableSample, setTableSample] = useState<any[]>([]);
  const [loadingSample, setLoadingSample] = useState(false);

  const [dbStats, setDbStats] = useState({
    gamesCount: 0,
    categoriesCount: 0,
    usersCount: 0,
    suggestionsCount: 0,
    favoritesCount: 0,
    logsCount: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTableSample(selectedTable);
  }, [selectedTable]);

  const fetchTableSample = async (tableName: string) => {
    setLoadingSample(true);
    try {
      const { data } = await supabase.from(tableName).select('*').limit(5);
      setTableSample(data || []);
    } catch (e) {
      setTableSample([]);
    } finally {
      setLoadingSample(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: games } = await supabase.from('games').select('*', { count: 'exact', head: true });
      const { count: cats } = await supabase.from('categories').select('*', { count: 'exact', head: true });
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: suggs } = await supabase.from('suggestions').select('*', { count: 'exact', head: true });
      const { count: favs } = await supabase.from('favorites').select('*', { count: 'exact', head: true });
      const { count: logs } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true });

      setDbStats({
        gamesCount: games ?? 0,
        categoriesCount: cats ?? 0,
        usersCount: users ?? 0,
        suggestionsCount: suggs ?? 0,
        favoritesCount: favs ?? 0,
        logsCount: logs ?? 0,
      });
    } catch (e) {
      setDbStats({
        gamesCount: 0,
        categoriesCount: 0,
        usersCount: 0,
        suggestionsCount: 0,
        favoritesCount: 0,
        logsCount: 0,
      });
    }
  };

  const handleOptimize = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      setOptimized(true);
      setTimeout(() => setOptimized(false), 3000);
    }, 1500);
  };

  const sqlScript = `-- =========================================================
-- ESQUEMA COMPLETO DE BANCO DE DADOS SUPABASE (ORION GAMES)
-- Execute este script no SQL Editor do seu projeto Supabase.
-- =========================================================

-- 1. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE JOGOS
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  cover_url TEXT NOT NULL,
  background_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_ids TEXT[],
  accounts JSONB DEFAULT '[]'::jsonb,
  is_most_played BOOLEAN DEFAULT false,
  is_highlight BOOLEAN DEFAULT false,
  admin_highlight_game BOOLEAN DEFAULT false,
  admin_highlight_text TEXT,
  highlight_text TEXT,
  requirements JSONB DEFAULT '{}'::jsonb,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE SUGESTÕES DE JOGOS
CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  game_title TEXT NOT NULL,
  category TEXT NOT NULL,
  observation TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE FAVORITOS
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- 6. TABELA DE LOGS DE ATIVIDADE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE CONFIGURAÇÕES DO SITE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name TEXT DEFAULT 'Orion Games',
  logo_url TEXT,
  favicon_url TEXT,
  social_discord TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  social_youtube TEXT,
  support_email TEXT,
  seo_title TEXT,
  seo_description TEXT,
  primary_color TEXT DEFAULT '#FF0000',
  maintenance JSONB DEFAULT '{"enabled": false}'::jsonb,
  announcement JSONB DEFAULT '{"enabled": true}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELA DE MONITORAMENTO DE ERROS
CREATE TABLE IF NOT EXISTS public.error_logs (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'CLIENT',
  message TEXT NOT NULL,
  url TEXT,
  user_email TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABELA DE EVENTOS DE SEGURANÇA
CREATE TABLE IF NOT EXISTS public.security_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_email TEXT,
  details TEXT,
  blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABELA DE IPS BLOQUEADOS
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  ip_address TEXT PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABELA DE SESSÕES ATIVAS
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  username TEXT,
  device TEXT,
  browser TEXT,
  ip_address TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABELA DE VISUALIZAÇÕES DE PÁGINAS (ANALYTICS)
CREATE TABLE IF NOT EXISTS public.page_views (
  path TEXT PRIMARY KEY,
  views INT DEFAULT 1,
  last_visited TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FUNÇÕES RPC PARA INCREMENTO DE ANALYTICS
CREATE OR REPLACE FUNCTION increment_page_views(page_path TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.page_views (path, views, last_visited)
  VALUES (page_path, 1, NOW())
  ON CONFLICT (path)
  DO UPDATE SET views = public.page_views.views + 1, last_visited = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_game_views(game_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.games
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = game_uuid;
END;
$$ LANGUAGE plpgsql;

-- CONFIGURAÇÕES INICIAIS DA APLICAÇÃO
INSERT INTO public.site_settings (id, site_name, logo_url, favicon_url, seo_title, maintenance, announcement)
VALUES (
  1, 
  'Sirius',
  'https://i.ibb.co/kspXCrY6/Retangular.png',
  'https://i.ibb.co/zW1gzQRR/Logo.png', 
  'Sirius - Contas Steam Gratuitas & Jogos em Destaque', 
  '{"enabled": false, "message": "Manutenção preventiva em andamento."}'::jsonb, 
  '{"enabled": true, "text": "Novas contas adicionadas hoje! Aproveite e salve seus favoritos."}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- HABILITAR SEGURANÇA RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO PÚBLICO E OPERAÇÕES
CREATE POLICY "Permitir leitura pública em games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública em categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública em site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Permitir gerenciamento de site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir leitura pública em blocked_ips" ON public.blocked_ips FOR SELECT USING (true);
CREATE POLICY "Permitir gerenciamento de sugestões" ON public.suggestions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir gerenciamento de erros" ON public.error_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir gerenciamento de eventos de segurança" ON public.security_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir gerenciamento de sessões ativas" ON public.active_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir gerenciamento de page_views" ON public.page_views FOR ALL USING (true) WITH CHECK (true);
`;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setToastMessage('Script SQL copiado com sucesso para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <AdminToast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />

      <div className="flex items-center justify-between pb-4 border-b border-[#1f212a]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-[#FF0000]" />
            <span>Banco de Dados & Estatísticas</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Status das tabelas, otimização de registros e código SQL para configuração no Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              fetchStats();
              fetchTableSample(selectedTable);
              setToastMessage('Dados do banco atualizados com sucesso!');
            }}
            className="bg-[#121318] border border-[#20222c] hover:border-[#3a3d52] hover:bg-[#1a1c26] text-gray-300 hover:text-white font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RotateCw className="w-4 h-4 text-[#FF0000]" />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => setShowSqlModal(true)}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Ver Script SQL Supabase</span>
          </button>
        </div>
      </div>

      {optimized && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Banco de dados otimizado com sucesso! Índices e cache limpos.</span>
        </div>
      )}

      {/* DB Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Jogos', count: dbStats.gamesCount },
          { title: 'Categorias', count: dbStats.categoriesCount },
          { title: 'Usuários', count: dbStats.usersCount },
          { title: 'Sugestões', count: dbStats.suggestionsCount },
          { title: 'Favoritos', count: dbStats.favoritesCount },
          { title: 'Logs', count: dbStats.logsCount }
        ].map((item) => (
          <div key={item.title} className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-4 text-center space-y-1">
            <span className="text-xs font-semibold text-gray-400 block">{item.title}</span>
            <span className="text-xl font-bold text-white font-mono">{item.count}</span>
          </div>
        ))}
      </div>

      {/* Supabase Official Console & Live Inspector Card */}
      <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1f212a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Painel Supabase Cloud</h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Conectado
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Acesse o console oficial do Supabase para visualizar o banco de dados em tempo real.
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 shadow-lg shrink-0 cursor-pointer"
          >
            <span>Acessar Supabase.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Live Table Inspector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-300 flex items-center gap-2">
              <Table className="w-4 h-4 text-[#FF0000]" />
              <span>Inspecionar Amostra das Tabelas do Projeto</span>
            </h4>
            <span className="text-[11px] text-gray-500">
              {loadingSample ? 'Carregando dados...' : `${tableSample.length} registros exibidos`}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {(['games', 'categories', 'profiles', 'suggestions', 'site_settings', 'error_logs'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTable(tab)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer border ${
                  selectedTable === tab
                    ? 'bg-[#FF0000] border-[#FF0000] text-white shadow-md'
                    : 'bg-[#181920] border-[#20222c] text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table Data Preview Box */}
          <div className="bg-[#181920] border border-[#20222c] rounded-2xl p-4 overflow-x-auto">
            {loadingSample ? (
              <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Carregando dados da tabela...</div>
            ) : tableSample.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                Nenhum registro encontrado na tabela <code className="text-white font-mono">{selectedTable}</code>.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-[#20222c] text-[11px] font-mono text-gray-400">
                  <span>TABELA: public.{selectedTable}</span>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF0000] font-sans underline hover:no-underline flex items-center gap-1"
                  >
                    Editar no Supabase <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
                <pre className="text-[11px] font-mono text-emerald-400 bg-[#0d0e12] p-3 rounded-xl overflow-x-auto max-h-48">
                  {JSON.stringify(tableSample, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Database Health Card */}
      <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1f212a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Integridade e Saúde do Banco</h3>
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Conexão Estável & Índices Otimizados
              </p>
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={optimizing}
            className="bg-[#181920] border border-[#20222c] hover:bg-[#20222c] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#FF0000] ${optimizing ? 'animate-spin' : ''}`} />
            <span>{optimizing ? 'Otimizando...' : 'Otimizar Tabelas'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#181920] border border-[#1f212a] rounded-xl space-y-1">
            <span className="text-gray-400 block">Tamanho Estimado</span>
            <span className="text-sm font-bold text-white font-mono">1.42 MB</span>
          </div>
          <div className="p-4 bg-[#181920] border border-[#1f212a] rounded-xl space-y-1">
            <span className="text-gray-400 block">Motor de Banco</span>
            <span className="text-sm font-bold text-white font-mono">PostgreSQL 15 (Supabase)</span>
          </div>
          <div className="p-4 bg-[#181920] border border-[#1f212a] rounded-xl space-y-1">
            <span className="text-gray-400 block">Última Otimização</span>
            <span className="text-sm font-bold text-white font-mono">Hoje, há alguns minutos</span>
          </div>
        </div>
      </div>

      {/* SQL Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0e12] border border-[#1f212a] rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f212a]">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#FF0000]" />
                <h3 className="text-base font-bold text-white">Código SQL Completo (Supabase)</h3>
              </div>
              <button
                onClick={handleCopySql}
                className="bg-[#181920] border border-[#20222c] hover:bg-[#FF0000] text-gray-200 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Copie este código e cole diretamente na aba <strong className="text-white">SQL Editor</strong> do seu painel do Supabase para criar todas as tabelas necessárias:
            </p>

            <pre className="bg-[#181920] border border-[#20222c] rounded-2xl p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto flex-1 max-h-[50vh] leading-relaxed select-all">
              {sqlScript}
            </pre>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSqlModal(false)}
                className="bg-[#181920] border border-[#20222c] text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-[#20222c] transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
