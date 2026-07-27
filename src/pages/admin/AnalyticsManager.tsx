import React, { useState } from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { BarChart3, Eye, Heart, Users, Gamepad2, ArrowUpRight, RotateCw } from 'lucide-react';
import { AdminToast } from '../../components/admin/AdminModal';

export const AnalyticsManager = () => {
  const { analytics, refreshAnalytics } = useSiteSettings();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    await refreshAnalytics();
    setToastMessage('Estatísticas atualizadas com sucesso!');
  };

  const totalPageViews = (Object.values(analytics.pageViews) as number[]).reduce((a, b) => a + b, 0);
  const gameViewsEntries = Object.entries(analytics.gameViews) as [string, { title: string; views: number }][];
  const pageViewsEntries = Object.entries(analytics.pageViews) as [string, number][];

  return (
    <div className="space-y-6">
      <AdminToast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />

      <div className="flex items-center justify-between pb-4 border-b border-[#1f212a]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#FF0000]" />
            <span>Analytics & Estatísticas do Site</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Métricas em tempo real de acessos, jogos mais visualizados, favoritos e usuários cadastrados.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="bg-[#121318] border border-[#20222c] hover:border-[#3a3d52] hover:bg-[#1a1c26] text-gray-300 hover:text-white font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <RotateCw className="w-4 h-4 text-[#FF0000]" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Total de Visualizações</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalPageViews.toLocaleString()}</p>
          <span className="text-[11px] text-gray-500">Métrica real do banco</span>
        </div>

        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Favoritos Salvos</span>
            <div className="w-8 h-8 rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center text-[#FF0000]">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.totalFavorites}</p>
          <span className="text-[11px] text-gray-500">Favoritos ativos dos usuários</span>
        </div>

        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Total de Usuários</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.totalUsers}</p>
          <span className="text-[11px] text-gray-500">Contas criadas na plataforma</span>
        </div>
      </div>

      {/* Grid Charts / Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Games */}
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-[#FF0000]" />
            <span>Jogos Mais Visualizados</span>
          </h3>
          <div className="space-y-3">
            {gameViewsEntries.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">Nenhuma visualização de jogo registrada ainda.</p>
            ) : (
              gameViewsEntries.map(([id, game], idx) => {
                const max = Math.max(...gameViewsEntries.map(([, g]) => g.views), 1);
                const percent = Math.min(100, Math.round((game.views / max) * 100));
                return (
                  <div key={id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-white truncate">#{idx + 1} {game.title}</span>
                      <span className="text-gray-400 font-mono">{game.views.toLocaleString()} views</span>
                    </div>
                    <div className="w-full bg-[#181920] h-2 rounded-full overflow-hidden border border-[#1f212a]">
                      <div className="bg-gradient-to-r from-[#FF0000] to-[#ff4d4d] h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Most Visited Pages */}
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Páginas Mais Acessadas</span>
          </h3>
          <div className="space-y-3">
            {pageViewsEntries.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">Nenhum acesso de página registrado ainda.</p>
            ) : (
              pageViewsEntries.map(([path, views]) => (
                <div key={path} className="flex items-center justify-between p-3 bg-[#181920] border border-[#1f212a] rounded-xl text-xs">
                  <div className="flex items-center gap-2 font-mono text-gray-300">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#FF0000]" />
                    <span>{path}</span>
                  </div>
                  <span className="font-bold text-white font-mono bg-[#0d0e12] px-2.5 py-1 rounded-lg border border-[#20222c]">
                    {views.toLocaleString()} acessos
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
