import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GameCard, Game } from '../components/GameCard';
import { useLanguage, getCategoryTranslation } from '../contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../data/categoriesData';
import { Breadcrumb } from '../components/Breadcrumb';
import { Skeleton } from '../components/Skeleton';
import { sortGamesAlphanumeric } from '../lib/gameUtils';
import { usePageTitle } from '../hooks/usePageTitle';

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [games, setGames] = useState<Game[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  usePageTitle(category?.name || 'Categoria');

  useEffect(() => {
    fetchCategoryAndGames();
  }, [slug]);

  const fetchCategoryAndGames = async () => {
    setLoading(true);
    const start = Date.now();
    try {
      let catData: any = null;
      const { data } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
      catData = data;

      if (!catData) {
        catData = DEFAULT_CATEGORIES.find(c => c.slug?.toLowerCase() === slug?.toLowerCase());
      }

      if (catData) {
        setCategory(catData);
        let gamesData: any[] = [];
        
        if (catData.id) {
          let gamesRes = await supabase
            .from('games')
            .select('id, title, description, cover_url, is_highlight, category_ids, highlight_text')
            .contains('category_ids', [catData.id])
            .order('created_at', { ascending: false });

          if (gamesRes.error) {
            const fallback = await supabase
              .from('games')
              .select('id, title, description, cover_url, category:categories(name)')
              .eq('category_id', catData.id)
              .order('created_at', { ascending: false });
            gamesData = fallback.data || [];
          } else {
            gamesData = gamesRes.data || [];
          }
        }

        // If no direct ID match or it's a default category without DB id, search by text or all games filtered by title/description
        if (gamesData.length === 0) {
          const { data: allGames } = await supabase.from('games').select('*');
          if (allGames) {
            gamesData = allGames.filter((g: any) => {
              const text = (g.title + ' ' + (g.description || '')).toLowerCase();
              return text.includes(catData.name.toLowerCase()) || text.includes((slug || '').toLowerCase());
            });
          }
        }

        const mapped = gamesData.map((g: any) => ({
          ...g,
          category: { name: catData.name }
        }));
        setGames(sortGamesAlphanumeric(mapped as unknown as Game[]) as Game[]);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 200 - elapsed);
      setTimeout(() => setLoading(false), remaining);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] pb-20 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <GameCard key={i} isLoading />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#000000] p-8 flex items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold text-white">{t('category_not_found')}</h2>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-[#FF0000] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:bg-[#e60000] transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back_to_start')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] pb-20">
      <div className="relative h-[30vh] md:h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img 
          src={category.image_url || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1200'} 
          alt={category.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">{getCategoryTranslation(category.name, t)}</h1>
          <p className="text-gray-300 text-xs sm:text-sm mb-5">{t('explore_category_games')}</p>
          
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-[#FF0000] text-white hover:bg-[#e60000] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_menu')}</span>
          </Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-8">
          <Breadcrumb 
            items={[
              { label: t('categories'), path: '/' },
              { label: getCategoryTranslation(category.name, t) }
            ]}
          />
        </div>

        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] my-12">
            <div className="text-center py-12 px-8 bg-[#121318] border border-[#1f212a] rounded-2xl max-w-lg w-full shadow-sm">
              <p className="text-gray-400 text-xs sm:text-sm font-medium">{t('no_games_category')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
