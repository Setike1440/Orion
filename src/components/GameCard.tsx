import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { Skeleton } from './Skeleton';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export interface Game {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  category?: { name: string };
  isFavorite?: boolean;
  highlight_text?: string;
}

interface GameCardProps {
  key?: React.Key;
  game?: Game;
  isLoading?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, isLoading }) => {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();
  const [isFavorite, setIsFavorite] = useState<boolean>(!!game?.isFavorite);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setIsFavorite(!!game?.isFavorite);
  }, [game?.isFavorite]);

  useEffect(() => {
    let isMounted = true;
    const checkFavorite = async () => {
      if (!user || !game?.id) {
        if (isMounted && !game?.isFavorite) setIsFavorite(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('game_id')
          .eq('user_id', user.id)
          .eq('game_id', game.id)
          .maybeSingle();

        if (isMounted && !error) {
          setIsFavorite(!!data);
        }
      } catch (error) {
        console.error('Error syncing favorite state:', error);
      }
    };

    checkFavorite();

    const handleFavUpdated = () => {
      checkFavorite();
    };

    window.addEventListener('favorites-updated', handleFavUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('favorites-updated', handleFavUpdated);
    };
  }, [user, game?.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to game details
    e.stopPropagation();
    
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!game?.id || isLiking) return;

    const previousState = isFavorite;
    const nextState = !previousState;
    setIsFavorite(nextState);
    setIsLiking(true);

    try {
      if (previousState) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('game_id', game.id);
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, game_id: game.id });
      }
      window.dispatchEvent(new Event('favorites-updated'));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorite(previousState);
    } finally {
      setIsLiking(false);
    }
  };

  const getBadgeText = () => {
    if (!game?.id) return 'Jogar Agora';
    let localHighlights: Record<string, any> = {};
    try {
      localHighlights = JSON.parse(localStorage.getItem('custom_game_highlights') || '{}');
    } catch (e) {}
    const custom = localHighlights[game.id];
    const text = custom?.highlight_text || game.highlight_text || (game as any).admin_highlight_text;
    if (!text || text === 'Garantia Vitalícia' || text === 'Garantia' || text === 'GARANTIA' || text === 'Garantia vitalícia' || text === 'Jogue Agora') {
      return 'Jogar Agora';
    }
    return text;
  };

  if (isLoading || !game) {
    return (
      <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-3 flex flex-col gap-3">
        <Skeleton className="w-full aspect-[460/215] rounded-xl" />
        <div className="space-y-2 px-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="mt-2 flex items-center justify-between px-1">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <Link 
      to={`/jogo/${game.id}`}
      className="group bg-[#121318] border border-[#1f212a] hover:border-[#268FFF]/40 rounded-2xl p-3 flex flex-col gap-3 transition-all duration-200 relative overflow-hidden hover:-translate-y-1 hover:shadow-xl cursor-pointer"
    >
      <div className="relative aspect-[460/215] rounded-xl overflow-hidden bg-[#171821]">
        <img 
          src={game.cover_url} 
          alt={game.title}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        
        {/* Reflection / Shine sweep effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none z-20" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#121318] via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity"></div>
        
        <div className="absolute top-2 left-2 bg-[#268FFF] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm z-10">
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.03 4.524 4.524s-2.03 4.524-4.524 4.524c-.102 0-.201-.008-.302-.014l-4.062 2.922c.004.073.01.147.01.221 0 1.861-1.514 3.375-3.375 3.375-1.425 0-2.645-.888-3.136-2.14L.272 16.208C1.582 20.76 5.792 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
          </svg>
          <span>{getBadgeText()}</span>
        </div>

        <button 
          type="button"
          onClick={toggleFavorite}
          disabled={isLiking}
          className={cn(
            "absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all z-10 cursor-pointer shadow-sm",
            isFavorite 
              ? "bg-red-600/90 text-white border border-red-500 scale-105" 
              : "bg-[#0a0b0e]/70 text-gray-300 hover:text-white hover:scale-105 border border-white/10"
          )}
          title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart className={cn(
            "w-3.5 h-3.5 transition-all duration-200", 
            isFavorite ? "fill-white text-white" : "text-gray-300 hover:text-red-400"
          )} />
        </button>
      </div>
      
      <div className="px-0.5 flex flex-col flex-1">
        <h3 className="text-white font-medium text-xs sm:text-sm truncate block leading-snug mb-0.5 group-hover:text-[#268FFF] transition-colors">
          {game.title}
        </h3>
        <p className="text-[11px] text-gray-400 mb-2">{game.category?.name || 'Steam Offline'}</p>
        
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-[#1f212a]">
          <div className="flex flex-col">
            <span className="text-[9px] text-[#268FFF] uppercase tracking-wider font-semibold">{t('included')}</span>
            <span className="text-gray-400 text-[11px]">{t('active_sub')}</span>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-[#171821] group-hover:bg-[#268FFF] text-gray-300 group-hover:text-white border border-[#20222c] group-hover:border-[#268FFF] flex items-center justify-center transition-all text-[11px] font-semibold">
             {t('access')}
          </div>
        </div>
      </div>
    </Link>
  );
};
