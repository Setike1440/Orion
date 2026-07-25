import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, getCategoryTranslation } from '../contexts/LanguageContext';
import { ShieldCheck, Download, Lock, Key, Copy, CheckCircle2, ArrowLeft, Heart, MonitorCheck, Headphones, HelpCircle, User, Cpu, HardDrive, Monitor, Tv, MemoryStick, Layers } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { GameCard, Game } from '../components/GameCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageTitle } from '../hooks/usePageTitle';

export const GameDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedGames, setRelatedGames] = useState<Game[]>([]);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);

  usePageTitle(game?.title || 'Detalhes do Jogo');

  useEffect(() => {
    fetchGame();
  }, [id, user]);

  const fetchGame = async () => {
    setLoading(true);
    const start = Date.now();
    try {
      let gameRes = await supabase.from('games').select('*').eq('id', id).single();
      if (gameRes.error) throw gameRes.error;
      
      let allGamesData: any[] = [];
      let allGamesRes = await supabase.from('games').select('id, title, description, cover_url, category_ids, highlight_text').neq('id', id).limit(20);
      
      if (allGamesRes.error) {
        const fallback = await supabase.from('games').select('id, title, description, cover_url, category:categories(name)').neq('id', id).limit(20);
        allGamesData = fallback.data || [];
      } else {
        allGamesData = allGamesRes.data || [];
      }
      
      const catRes = await supabase.from('categories').select('*');
      const cats = catRes.data || [];
      
      let gameData = gameRes.data as any;

      let localHighlights: Record<string, any> = {};
      let localAccounts: Record<string, any[]> = {};
      try {
        localHighlights = JSON.parse(localStorage.getItem('custom_game_highlights') || '{}');
        localAccounts = JSON.parse(localStorage.getItem('custom_game_accounts') || '{}');
      } catch (e) {}
      const custom = localHighlights[gameData.id];
      const rawText = custom?.highlight_text || gameData.highlight_text || gameData.admin_highlight_text;
      gameData.highlight_text = (!rawText || rawText === 'Garantia Vitalícia' || rawText === 'Garantia' || rawText === 'GARANTIA' || rawText === 'Jogue Agora') ? 'Jogar Agora' : rawText;

      if (localAccounts[gameData.id] && Array.isArray(localAccounts[gameData.id]) && localAccounts[gameData.id].length > 0) {
        gameData.accounts = localAccounts[gameData.id];
      }

      if (gameData.category_ids && gameData.category_ids.length > 0) {
        const c = cats.find(c => c.id === gameData.category_ids[0]);
        if (c) gameData.category = { name: c.name, slug: c.slug };
      } else if (gameData.category_id) {
        const c = cats.find(c => c.id === gameData.category_id);
        if (c) gameData.category = { name: c.name, slug: c.slug };
      }
      setGame(gameData);

      // Preload images for maximum speed
      if (gameData.cover_url) {
        const img = new Image();
        img.src = gameData.cover_url;
      }
      if (gameData.images && Array.isArray(gameData.images)) {
        gameData.images.forEach((imgUrl: string) => {
          if (imgUrl) {
            const img = new Image();
            img.src = imgUrl;
          }
        });
      }

      if (user && gameData) {
        const { data: fav } = await supabase
          .from('favorites')
          .select('game_id')
          .eq('user_id', user.id)
          .eq('game_id', gameData.id)
          .maybeSingle();
        setIsFavorite(!!fav);
      }

      if (allGamesData.length > 0) {
        const mapped = allGamesData.map((g: any) => {
          let firstCategory = g.category;
          if (g.category_ids && g.category_ids.length > 0) {
            const matched = cats.find(c => c.id === g.category_ids[0]);
            if (matched) firstCategory = { name: matched.name };
          }
          return { ...g, category: firstCategory };
        });
        
        // Shuffle and pick 4
        const shuffled = mapped.sort(() => 0.5 - Math.random());
        setRelatedGames(shuffled.slice(0, 4) as unknown as Game[]);
      }
    } catch (error) {
      console.error('Error fetching game details:', error);
    } finally {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 200 - elapsed);
      setTimeout(() => setLoading(false), remaining);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!game) return;
    setIsLiking(true);
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('game_id', game.id);
        setIsFavorite(false);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, game_id: game.id });
        setIsFavorite(true);
      }
      window.dispatchEvent(new Event('favorites-updated'));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const copyToClipboard = (text: string, type: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'user') {
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Skeleton className="w-full aspect-[460/215] rounded-2xl" />
            </div>
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-1/4 mb-8 rounded-lg" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full mt-8 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
        <h2 className="text-2xl font-bold mb-2">{t('game_not_found')}</h2>
        <Link to="/" className="text-[#FF0000] hover:underline">{t('back_home')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 pb-4 md:pb-6">
      
      {/* Return Arrow & Breadcrumb Path */}
      <div className="mb-6 space-y-3">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-[#FF0000] text-white hover:bg-[#e60000] text-sm font-bold transition-all px-5 py-2.5 rounded-xl shadow-md group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{t('back_to_menu')}</span>
        </button>

        <Breadcrumb 
          items={[
            { label: t('all_games'), path: '/' },
            { 
              label: getCategoryTranslation(game.category?.name, t) || 'Steam', 
              path: game.category?.slug ? `/categoria/${game.category.slug}` : '/' 
            },
            { label: game.title }
          ]} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cover Image */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            <div className="bg-[#121318] border border-[#1f212a] p-4 rounded-2xl shadow-sm">
              <div className="relative aspect-[460/215] rounded-xl overflow-hidden mb-5">
                <img 
                  src={game.cover_url} 
                  alt={game.title}
                  loading="eager"
                  decoding="async"
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#FF0000] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.03 4.524 4.524s-2.03 4.524-4.524 4.524c-.102 0-.201-.008-.302-.014l-4.062 2.922c.004.073.01.147.01.221 0 1.861-1.514 3.375-3.375 3.375-1.425 0-2.645-.888-3.136-2.14L.272 16.208C1.582 20.76 5.792 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                  </svg>
                  <span>{(!game.highlight_text || game.highlight_text === 'Garantia Vitalícia' || game.highlight_text === 'Garantia' || game.highlight_text === 'Jogue Agora') ? t('play_now') : game.highlight_text}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <a href="https://store.steampowered.com/about/" target="_blank" rel="noreferrer" className="w-full bg-[#181920] hover:bg-[#20222c] border border-[#20222c] text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                  <Download className="w-4 h-4" />
                  {t('download_steam')}
                </a>
              </div>
            </div>

            {game.images && game.images.length > 0 && (
              <div className="bg-[#121318] border border-[#1f212a] p-4 rounded-2xl space-y-4 shadow-sm">
                {game.images.map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative aspect-[460/215] rounded-xl overflow-hidden border border-[#1f212a]">
                    <img 
                      src={imgUrl} 
                      alt={`${game.title} screenshot ${idx + 1}`}
                      loading="eager"
                      decoding="async"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-8 flex flex-col">
          
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div className="inline-block px-3 py-1 bg-[#121318] border border-[#1f212a] text-gray-300 rounded-full text-xs font-semibold">
                {getCategoryTranslation(game.category?.name, t) || 'Steam Offline'}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/requisitos-do-pc?gameId=${game.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white text-black hover:bg-gray-200 border border-white transition-all shadow-sm cursor-pointer group"
                >
                  <MonitorCheck className="w-4 h-4 text-black transition-colors" />
                  <span>{t('can_i_run_it')}</span>
                </Link>

                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={isLiking}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer ${
                    isFavorite
                      ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500'
                      : 'bg-[#121318] border border-[#1f212a] text-white hover:bg-[#181920]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span>{isFavorite ? t('game_favorited') : t('favorite_game')}</span>
                </button>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
              {game.title}
            </h1>
            <div className="prose prose-invert max-w-none text-gray-400">
              <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {game.description || t('no_desc')}
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#252733] to-transparent my-8" />

          <div className="mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Key className="w-5 h-5 text-[#FF0000]" />
                {t('game_access')}
              </h2>

              {/* Support Contact Button */}
              <button 
                type="button"
                onClick={() => {}}
                className="inline-flex items-center gap-2 bg-[#181920] hover:bg-[#20222c] border border-[#20222c] text-gray-300 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Headphones className="w-4 h-4 text-[#FF0000]" />
                <span>{t('account_not_working')}</span>
              </button>
            </div>

            {user ? (() => {
              let accountsList: any[] = [];
              try {
                const localAccounts = JSON.parse(localStorage.getItem('custom_game_accounts') || '{}');
                if (localAccounts[game.id] && Array.isArray(localAccounts[game.id]) && localAccounts[game.id].length > 0) {
                  accountsList = localAccounts[game.id];
                }
              } catch (e) {}

              if (accountsList.length === 0) {
                if (game.accounts && Array.isArray(game.accounts) && game.accounts.length > 0) {
                  accountsList = game.accounts;
                } else {
                  accountsList = [{ name: 'Conta 1', steam_username: game.steam_username, steam_password: game.steam_password }];
                }
              }

              const currentAccount = accountsList[activeAccountIndex] || accountsList[0];

              return (
                <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 relative overflow-hidden shadow-sm space-y-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0000] opacity-5 blur-[80px] rounded-full"></div>
                  
                  {/* Account Selector if multiple */}
                  {accountsList.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#1f212a]">
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#FF0000]" /> {t('available_accounts')}
                      </span>
                      {accountsList.map((acc: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveAccountIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            activeAccountIndex === idx
                              ? 'bg-[#FF0000] text-white shadow-sm'
                              : 'bg-[#181920] border border-[#1f212a] text-gray-400 hover:text-white'
                          }`}
                        >
                          {acc.name || `Conta ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-gray-400 max-w-xl leading-relaxed">
                    {t('steps_title')} {t('steps_desc')}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#000000] border border-[#1f212a] rounded-xl p-4">
                      <label className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block mb-1.5">{t('steam_user')}</label>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-white font-mono text-base">{currentAccount.steam_username}</span>
                        <button 
                          onClick={() => copyToClipboard(currentAccount.steam_username, 'user')}
                          className="text-gray-400 hover:text-[#FF0000] transition-colors p-2 bg-[#121318] border border-[#1f212a] rounded-lg cursor-pointer"
                          title={t('copy_user')}
                        >
                          {copiedUser ? <CheckCircle2 className="w-4 h-4 text-[#FF0000]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#000000] border border-[#1f212a] rounded-xl p-4">
                      <label className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block mb-1.5">{t('steam_pass')}</label>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-white font-mono text-base">{currentAccount.steam_password}</span>
                        <button 
                          onClick={() => copyToClipboard(currentAccount.steam_password, 'pass')}
                          className="text-gray-400 hover:text-[#FF0000] transition-colors p-2 bg-[#121318] border border-[#1f212a] rounded-lg cursor-pointer"
                          title={t('copy_pass')}
                        >
                          {copiedPass ? <CheckCircle2 className="w-4 h-4 text-[#FF0000]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3">
                    <Lock className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-200/80 leading-relaxed">
                      <strong className="text-yellow-500 block mb-0.5">{t('important_rule_title')}</strong>
                      {t('important_rule_desc')}
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-8 text-center flex flex-col items-center justify-center shadow-sm">
                <Lock className="w-10 h-10 text-gray-500 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1.5">{t('login_needed')}</h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-6 max-w-md leading-relaxed">
                  {t('login_needed_desc')}
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => openAuthModal('login')} className="bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer text-xs sm:text-sm shadow-sm">
                    {t('login')}
                  </button>
                  <button type="button" onClick={() => openAuthModal('register')} className="bg-[#181920] border border-[#20222c] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#20222c] transition-all cursor-pointer text-xs sm:text-sm shadow-sm">
                    {t('register')}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {game.requirements && (
            <>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#252733] to-transparent my-8" />
              <div className="mt-4">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-[#FF0000]" />
                {t('sys_req')}
              </h2>
              <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 shadow-sm">
                {(() => {
                  const lines = game.requirements.split('\n').map((l: string) => l.trim()).filter(Boolean);
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {lines.map((line: string, idx: number) => {
                        let icon = <Cpu className="w-4 h-4 text-[#FF0000] shrink-0" />;
                        const lower = line.toLowerCase();
                        if (lower.includes('so:') || lower.includes('os:') || lower.includes('sistema')) {
                          icon = <Monitor className="w-4 h-4 text-[#FF0000] shrink-0" />;
                        } else if (lower.includes('processador') || lower.includes('cpu') || lower.includes('processor')) {
                          icon = <Cpu className="w-4 h-4 text-[#FF0000] shrink-0" />;
                        } else if (lower.includes('memória') || lower.includes('memoria') || lower.includes('ram') || lower.includes('memory')) {
                          icon = <MemoryStick className="w-4 h-4 text-[#FF0000] shrink-0" />;
                        } else if (lower.includes('placa') || lower.includes('vídeo') || lower.includes('video') || lower.includes('gpu') || lower.includes('graphics')) {
                          icon = <Tv className="w-4 h-4 text-[#FF0000] shrink-0" />;
                        } else if (lower.includes('armazenamento') || lower.includes('disco') || lower.includes('storage') || lower.includes('espaço')) {
                          icon = <HardDrive className="w-4 h-4 text-[#FF0000] shrink-0" />;
                        } else {
                          icon = <Layers className="w-4 h-4 text-[#FF0000] shrink-0" />;
                        }

                        const colonIdx = line.indexOf(':');
                        let label = '';
                        let val = line;
                        if (colonIdx !== -1) {
                          label = line.substring(0, colonIdx).trim();
                          val = line.substring(colonIdx + 1).trim();
                        }

                        return (
                          <div key={idx} className="bg-[#000000] border border-[#1f212a] p-3.5 rounded-xl flex items-start gap-3">
                            <div className="p-2 bg-[#121318] border border-[#1f212a] rounded-lg shrink-0 mt-0.5">
                              {icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              {label ? (
                                <>
                                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-0.5">{label}</span>
                                  <span className="text-xs sm:text-sm text-gray-200 font-medium leading-snug block">{val}</span>
                                </>
                              ) : (
                                <span className="text-xs sm:text-sm text-gray-200 font-medium leading-snug block">{line}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
          )}
        </div>
      </div>
      
      {relatedGames.length > 0 && (
        <div className="mt-10 border-t border-[#1f212a] pt-8">
          <h2 className="text-lg font-bold text-white mb-5 tracking-tight">{t('related_games')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedGames.map(g => (
              <GameCard key={`related-${g.id}`} game={g} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
