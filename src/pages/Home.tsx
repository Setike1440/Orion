import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GameCard, Game } from '../components/GameCard';
import { Skeleton } from '../components/Skeleton';
import { Flame, Sparkles, Search, Gamepad2, LayoutGrid, ChevronLeft, ChevronRight, ArrowRight, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { DEFAULT_CATEGORIES } from '../data/categoriesData';
import { sortGamesAlphanumeric } from '../lib/gameUtils';
import { usePageTitle } from '../hooks/usePageTitle';

export const Home = () => {
  usePageTitle('Sirius');
  const { user } = useAuth();
  const { t } = useLanguage();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [categories, setCategories] = useState<any[]>([]);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const recentlyAddedRef = useRef<HTMLDivElement>(null);
  const mostPlayedRef = useRef<HTMLDivElement>(null);

  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(true);

  const [visibleCatCount, setVisibleCatCount] = useState(6);
  const [visibleRecentCount, setVisibleRecentCount] = useState(4);
  const [visibleMostPlayedCount, setVisibleMostPlayedCount] = useState(4);

  const updateCatVisible = () => {
    if (categoriesRef.current) {
      const el = categoriesRef.current;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
        setVisibleCatCount(categories.length);
      } else {
        const first = el.children[0] as HTMLElement;
        const itemW = first ? first.offsetWidth + 16 : 180;
        const maxVis = Math.max(1, Math.min(categories.length, Math.ceil((el.scrollLeft + el.clientWidth) / itemW)));
        setVisibleCatCount(maxVis);
      }
    }
  };

  const updateRecentVisible = () => {
    if (recentlyAddedRef.current) {
      const el = recentlyAddedRef.current;
      const total = Math.min(8, games.length);
      if (total === 0) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
        setVisibleRecentCount(total);
      } else {
        const first = el.children[0] as HTMLElement;
        const itemW = first ? first.offsetWidth + 20 : 250;
        const maxVis = Math.max(1, Math.min(total, Math.ceil((el.scrollLeft + el.clientWidth) / itemW)));
        setVisibleRecentCount(maxVis);
      }
    }
  };

  const updateMostPlayedVisible = () => {
    if (mostPlayedRef.current) {
      const el = mostPlayedRef.current;
      const mostPlayedGames = games.filter(g => g.is_highlight || (g as any).admin_highlight_game || (g.category_ids && g.category_ids.includes('admin-highline-game')));
      const total = mostPlayedGames.length;
      if (total === 0) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
        setVisibleMostPlayedCount(total);
      } else {
        const first = el.children[0] as HTMLElement;
        const itemW = first ? first.offsetWidth + 20 : 250;
        const maxVis = Math.max(1, Math.min(total, Math.ceil((el.scrollLeft + el.clientWidth) / itemW)));
        setVisibleMostPlayedCount(maxVis);
      }
    }
  };

  const checkCategoriesScroll = () => {
    if (categoriesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoriesRef.current;
      setCanScrollCategoriesLeft(scrollLeft > 10);
      setCanScrollCategoriesRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const catEl = categoriesRef.current;
    if (catEl) {
      checkCategoriesScroll();
      updateCatVisible();
      catEl.addEventListener('scroll', checkCategoriesScroll);
      catEl.addEventListener('scroll', updateCatVisible);
      return () => {
        catEl.removeEventListener('scroll', checkCategoriesScroll);
        catEl.removeEventListener('scroll', updateCatVisible);
      };
    }
  }, [categories]);

  useEffect(() => {
    const recEl = recentlyAddedRef.current;
    if (recEl) {
      updateRecentVisible();
      recEl.addEventListener('scroll', updateRecentVisible);
      return () => recEl.removeEventListener('scroll', updateRecentVisible);
    }
  }, [games]);

  useEffect(() => {
    const mpEl = mostPlayedRef.current;
    if (mpEl) {
      updateMostPlayedVisible();
      mpEl.addEventListener('scroll', updateMostPlayedVisible);
      return () => mpEl.removeEventListener('scroll', updateMostPlayedVisible);
    }
  }, [games]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const firstChild = categoriesRef.current.firstElementChild as HTMLElement;
      const step = firstChild ? firstChild.offsetWidth + 16 : 220;
      const scrollAmount = direction === 'left' ? -step : step;
      categoriesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(updateCatVisible, 350);
    }
  };

  const scrollRecentlyAdded = (direction: 'left' | 'right') => {
    if (recentlyAddedRef.current) {
      const firstChild = recentlyAddedRef.current.firstElementChild as HTMLElement;
      const step = firstChild ? firstChild.offsetWidth + 16 : 280;
      const scrollAmount = direction === 'left' ? -step : step;
      recentlyAddedRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(updateRecentVisible, 350);
    }
  };

  const scrollMostPlayed = (direction: 'left' | 'right') => {
    if (mostPlayedRef.current) {
      const firstChild = mostPlayedRef.current.firstElementChild as HTMLElement;
      const step = firstChild ? firstChild.offsetWidth + 16 : 280;
      const scrollAmount = direction === 'left' ? -step : step;
      mostPlayedRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(updateMostPlayedVisible, 350);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [user]);

  const fetchGames = async () => {
    try {
      let gamesData: any[] = [];
      let gamesResponse = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (gamesResponse.error) {
        const fallback = await supabase
          .from('games')
          .select('id, title, description, cover_url, category:categories(name)')
          .order('created_at', { ascending: false });
        if (fallback.error) throw fallback.error;
        gamesData = fallback.data || [];
      } else {
        gamesData = gamesResponse.data || [];
      }

      const categoriesResponse = await supabase.from('categories').select('*');
      
      let finalGames = gamesData;
      const dbCats = categoriesResponse.data || [];
      
      const mergedCats = [...dbCats];
      DEFAULT_CATEGORIES.forEach(defCat => {
        if (!mergedCats.some(c => (c.slug && c.slug.toLowerCase() === defCat.slug.toLowerCase()) || (c.name && c.name.toLowerCase() === defCat.name.toLowerCase()))) {
          mergedCats.push(defCat);
        }
      });
      setCategories(mergedCats);

      let localHighlights: Record<string, any> = {};
      try {
        localHighlights = JSON.parse(localStorage.getItem('custom_game_highlights') || '{}');
      } catch (e) {}

      // Map categories and custom highlights to games
      finalGames = finalGames.map((game: any) => {
        let firstCategory = game.category;
        if (game.category_ids && game.category_ids.length > 0) {
          const matched = mergedCats.find(c => c.id === game.category_ids[0]);
          if (matched) firstCategory = { name: matched.name };
        } else if (game.category_id) {
          const matched = mergedCats.find(c => c.id === game.category_id);
          if (matched) firstCategory = { name: matched.name };
        }

        const custom = localHighlights[game.id];
        const isHighlight = custom ? Boolean(custom.is_most_played) : Boolean(game.admin_highlight_game || game.is_most_played);

        return {
          ...game,
          category: firstCategory,
          admin_highlight_game: isHighlight,
          is_most_played: isHighlight,
          admin_highlight_text: custom?.highlight_text || game.highlight_text || game.admin_highlight_text,
          highlight_text: custom?.highlight_text || game.highlight_text || game.admin_highlight_text
        };
      });

      if (user && finalGames.length > 0) {
        // Fetch favorites
        const { data: favs } = await supabase
          .from('favorites')
          .select('game_id')
          .eq('user_id', user.id);
        
        const favIds = new Set((favs || []).map(f => f.game_id));
        finalGames = finalGames.map(game => ({
          ...game,
          isFavorite: favIds.has(game.id)
        }));
      }

      setGames(finalGames as unknown as Game[]);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 pb-6">
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight leading-[1.15]">
            {t('hero_title_1')} <span className="text-[#FF0000]">{t('hero_title_2')}</span>
          </h1>
          <p className="text-gray-400 max-w-lg text-xs sm:text-sm md:text-base leading-relaxed mb-8">
            {t('hero_desc')}
          </p>

          <div className="w-full max-w-xl relative group">
            <div className="relative">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('hero_search')} 
                className="w-full bg-[#121318] border border-[#20222c] rounded-full py-3.5 px-5 pl-12 pr-10 text-sm focus:outline-none focus:border-[#FF0000] focus:ring-2 focus:ring-[#FF0000]/15 transition-all text-white placeholder-gray-500 shadow-sm"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500 group-focus-within:text-[#FF0000] transition-colors" />
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
                  title="Limpar pesquisa"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Link 
              to="/como-funciona"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer group/link"
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-white transition-all" />
              <span>{t('how_it_works')}</span>
            </Link>
          </div>
        </div>

        {searchTerm ? (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Search className="w-4 h-4 text-[#FF0000]" />
              <h2 className="text-lg font-semibold text-white tracking-tight">{t('search_results')}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {sortGamesAlphanumeric<Game>(games.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()))).length > 0 ? (
                sortGamesAlphanumeric<Game>(games.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()))).map((game) => <GameCard key={game.id} game={game} />)
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 bg-[#121318] border border-[#1f212a] rounded-2xl">
                  <Sparkles className="w-7 h-7 mb-3 opacity-40 text-gray-400" />
                  <p className="text-xs sm:text-sm">{t('no_games_search')}</p>
                </div>
              )}
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-10 mb-12">
            {/* Skeleton Categories row */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-6 w-40 rounded-lg" />
              </div>
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-44 rounded-2xl shrink-0" />
                ))}
              </div>
            </div>

            {/* Skeleton Games grid */}
            <div>
              <Skeleton className="h-6 w-40 rounded-lg mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => <GameCard key={i} isLoading />)}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Section: Categories */}
            {categories.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-[#FF0000]" />
                    <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">{t('categories')}</h2>
                  </div>
                  {/* Carousel Indicator & Arrow Controls */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium">
                      [ {t('showing')} {Math.min(categories.length, visibleCatCount)} {t('of')} {categories.length} {t('categories_label')} ]
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => scrollCategories('left')}
                        className="w-8 h-8 rounded-full bg-[#FF0000] hover:bg-[#e60000] border border-[#FF0000] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                        title="Anterior"
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCategories('right')}
                        className="w-8 h-8 rounded-full bg-[#FF0000] hover:bg-[#e60000] border border-[#FF0000] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                        title="Próximo"
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horizontal Scroll Track Wrapper with Soft Fade Edges */}
                <div className="relative group/carousel">
                  {/* Left Fade Mask (only if scrolled) */}
                  {canScrollCategoriesLeft && (
                    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#000000] to-transparent z-20 transition-opacity duration-300" />
                  )}
                  
                  {/* Right Fade Mask (only if can scroll further right) */}
                  {canScrollCategoriesRight && (
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#000000] to-transparent z-20 transition-opacity duration-300" />
                  )}

                  <div 
                    ref={categoriesRef}
                    className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pt-2 pb-2 px-0.5"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {categories.map((c) => (
                      <Link 
                        key={c.id || c.slug} 
                        to={`/categoria/${c.slug}`}
                        className="group relative flex-none w-36 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden bg-[#121318] border border-[#1f212a] hover:border-[#FF0000]/60 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-end p-3 cursor-pointer shadow-md"
                      >
                        {/* Gradient shadow overlay ONLY on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 z-10 transition-opacity duration-300" />
                        <img 
                          src={c.image_url || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=400'} 
                          alt={c.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="relative z-20 flex flex-col items-center text-center w-full pb-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-white tracking-wide uppercase mb-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            <span>{t('see_games') || 'Ver Jogos'}</span>
                            <ArrowRight className="w-3 h-3 text-[#FF0000]" />
                          </span>
                          <h3 className="text-white font-bold text-xs sm:text-sm group-hover:text-[#FF0000] transition-colors drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
                            {c.name}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Section: Recently Added */}
            {(() => {
              const recentGames = games.slice(0, 8);
              return (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FF0000]" />
                      <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">{t('recently_added')}</h2>
                    </div>
                    {/* Carousel Indicator & Controls */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-medium">
                        [ {t('showing')} {Math.min(recentGames.length, visibleRecentCount)} {t('of')} {recentGames.length} {t('games_label')} ]
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => scrollRecentlyAdded('left')}
                          className="w-8 h-8 rounded-full bg-[#FF0000] hover:bg-[#e60000] border border-[#FF0000] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                          title="Anterior"
                        >
                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollRecentlyAdded('right')}
                          className="w-8 h-8 rounded-full bg-[#FF0000] hover:bg-[#e60000] border border-[#FF0000] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                          title="Próximo"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div 
                    ref={recentlyAddedRef}
                    className="grid grid-flow-col auto-cols-[calc(100%-12px)] sm:auto-cols-[calc(50%-12px)] lg:auto-cols-[calc(25%-18px)] gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth pt-2 pb-2 px-0.5"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {recentGames.map((game) => (
                      <div key={`recent-${game.id}`} className="w-full">
                        <GameCard game={game} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Section: Lançamentos e Destaques */}
            {(() => {
              const highlightedGames = games.filter(g => (g as any).admin_highlight_game === true || (g as any).is_most_played === true);
              const displayHighlights = highlightedGames.slice(0, 8);
              
              if (displayHighlights.length === 0) return null;
              
              return (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#FF0000]" />
                      <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">{t('releases_highlights') || 'Lançamentos e destaques'}</h2>
                    </div>
                    {/* Carousel Indicator & Controls */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-medium">
                        [ {t('showing')} {Math.min(displayHighlights.length, visibleMostPlayedCount)} {t('of')} {displayHighlights.length} {t('games_label')} ]
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => scrollMostPlayed('left')}
                          className="w-8 h-8 rounded-full bg-[#FF0000] hover:bg-[#e60000] border border-[#FF0000] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                          title="Anterior"
                        >
                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollMostPlayed('right')}
                          className="w-8 h-8 rounded-full bg-[#FF0000] hover:bg-[#e60000] border border-[#FF0000] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                          title="Próximo"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div 
                    ref={mostPlayedRef}
                    className="grid grid-flow-col auto-cols-[calc(100%-12px)] sm:auto-cols-[calc(50%-12px)] lg:auto-cols-[calc(25%-18px)] gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth pt-2 pb-2 px-0.5"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {displayHighlights.map((game) => (
                      <div key={`highlight-${game.id}`} className="w-full">
                        <GameCard game={game} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Section: All Games */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-5">
                <Gamepad2 className="w-4 h-4 text-[#FF0000]" />
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">{t('all_games')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {sortGamesAlphanumeric<Game>(games).map((game) => <GameCard key={`all-${game.id}`} game={game} />)}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
