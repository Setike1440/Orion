import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { GameCard, Game } from '../components/GameCard';
import { Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { sortGamesAlphanumeric } from '../lib/gameUtils';
import { usePageTitle } from '../hooks/usePageTitle';

export const Favorites = () => {
  usePageTitle('Favoritos');
  const { user } = useAuth();
  const { t } = useLanguage();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites(true);
    }
    const handleFavUpdated = () => {
      if (user) {
        fetchFavorites(false);
      }
    };
    window.addEventListener('favorites-updated', handleFavUpdated);
    return () => {
      window.removeEventListener('favorites-updated', handleFavUpdated);
    };
  }, [user]);

  const fetchFavorites = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    const start = Date.now();
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          game_id,
          games (
            id, title, description, cover_url, category:categories(name)
          )
        `)
        .eq('user_id', user!.id);

      if (error) throw error;
      
      const favoriteGames = (data || [])
        .filter((fav: any) => fav.games)
        .map((fav: any) => ({
          ...fav.games,
          isFavorite: true
        }));

      setGames(sortGamesAlphanumeric(favoriteGames as Game[]) as Game[]);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      if (showLoading) {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 200 - elapsed);
        setTimeout(() => setLoading(false), remaining);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-white py-12 px-4">
        <Heart className="w-12 h-12 text-gray-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('login_req')}</h2>
        <p className="text-gray-400">{t('login_req_desc')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Breadcrumb 
          items={[
            { label: 'Minha Conta', path: '/configuracoes' },
            { label: 'Meus Favoritos' }
          ]} 
        />

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#121318] border border-[#1f212a] rounded-xl text-red-500">
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{t('favorites_title')}</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{t('favorites_desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <GameCard key={i} isLoading />)
          ) : games.length > 0 ? (
            games.map((game) => <GameCard key={game.id} game={game} />)
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-500 border border-[#1f212a] rounded-2xl bg-[#121318]">
              <Heart className="w-8 h-8 mb-3 text-red-500 opacity-40 fill-red-500" />
              <p className="text-sm font-semibold text-white mb-1">{t('no_favorites')}</p>
              <p className="text-xs text-gray-400">{t('favorites_explore')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
