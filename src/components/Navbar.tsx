import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { Gamepad2, User, LogOut, ShieldAlert, Search, Heart, ArrowRight, MonitorCheck, X, MessageSquarePlus } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { supabase } from '../lib/supabase';
import { Language, translations } from '../contexts/LanguageContext';

import { sortGamesAlphanumeric } from '../lib/gameUtils';

export const Navbar = () => {
  const { user, profile, signOut, openAuthModal, loading } = useAuth();
  const { settings } = useSiteSettings();
  const { t, language, setLanguage } = useLanguage();

  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setFavoritesCount(0);
      return;
    }

    const fetchFavoritesCount = async () => {
      const { count } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setFavoritesCount(count || 0);
    };

    fetchFavoritesCount();

    const handleUpdate = () => {
      fetchFavoritesCount();
    };

    window.addEventListener('favorites-updated', handleUpdate);
    return () => {
      window.removeEventListener('favorites-updated', handleUpdate);
    };
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setScrolledPastHero(true);
      } else {
        setScrolledPastHero(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async () => {
    const { data } = await supabase
      .from('games')
      .select('id, title, cover_url, category:categories(name)')
      .ilike('title', `%${searchTerm}%`)
      .limit(10);
    
    if (data) {
      setSearchResults(sortGamesAlphanumeric(data));
      setShowResults(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const showNavbarSearch = location.pathname !== '/' || scrolledPastHero;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#000000]/95 backdrop-blur-md border-b border-[#1f212a] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          
          {/* Logo & Search */}
          <div className="flex items-center gap-8 flex-1">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img 
                src={settings.logo_url && settings.logo_url !== 'https://i.ibb.co/zW1gzQRR/Logo.png' ? settings.logo_url : "https://i.ibb.co/kspXCrY6/Retangular.png"} 
                alt={settings.site_name || "Sirius"} 
                className="h-5 sm:h-6 w-auto object-contain" 
              />
            </Link>

            <div className={`hidden md:flex max-w-lg w-full relative transition-all duration-200 ${showNavbarSearch ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} ref={searchRef}>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowResults(true) }}
                placeholder={t('search_placeholder')} 
                className="w-full bg-[#0d0e12] border border-[#20222c] rounded-full py-2 px-4 pl-10 pr-10 text-xs sm:text-sm focus:outline-none focus:border-[#FF0000] focus:ring-2 focus:ring-[#FF0000]/15 transition-all text-white placeholder-gray-500"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setSearchResults([]); setShowResults(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
                  title="Limpar pesquisa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              
              {/* Search Results Popup */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0e12] border border-[#252733] rounded-xl shadow-2xl overflow-hidden z-50">
                  {searchResults.map((game) => (
                    <Link 
                      key={game.id} 
                      to={`/jogo/${game.id}`}
                      onClick={() => { setShowResults(false); setSearchTerm(''); }}
                      className="flex items-center gap-3 p-3 hover:bg-[#1a1c26] transition-colors border-b border-[#1f212a] last:border-0"
                    >
                      <img src={game.cover_url} alt={game.title} className="w-9 h-9 object-cover rounded-md border border-[#252733]" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-medium text-white truncate">{game.title}</h4>
                        <p className="text-[11px] text-gray-400 truncate">{game.category?.name || 'Steam'}</p>
                      </div>
                      <div className="text-[#FF0000] shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            
            <Link 
              to="/sugerir-jogo" 
              className="w-9 h-9 rounded-full bg-[#0d0e12] border border-[#20222c] hover:bg-[#1a1c26] hover:border-[#3a3d52] text-gray-400 hover:text-white flex items-center justify-center transition-all shadow-sm group cursor-pointer" 
              title={t('suggest_game')}
            >
              <MessageSquarePlus className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Link 
                to="/requisitos-do-pc" 
                className="w-9 h-9 rounded-full bg-[#0d0e12] border border-[#20222c] hover:bg-[#1a1c26] hover:border-[#3a3d52] text-gray-400 hover:text-white flex items-center justify-center transition-all shadow-sm group cursor-pointer" 
                title={t('can_i_run_it')}
              >
                <MonitorCheck className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </Link>
              <NotificationBell />
              {user && (
                <Link to="/favoritos" className="w-9 h-9 rounded-full bg-[#0d0e12] border border-[#20222c] hover:bg-[#1a1c26] hover:border-[#3a3d52] text-gray-400 hover:text-white flex items-center justify-center transition-all shadow-sm relative group" title={t('favorites_title')}>
                  <Heart className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FF0000] text-white font-bold text-[9px] min-w-[15px] h-3.5 px-1 rounded-full flex items-center justify-center shadow-md">
                      {favoritesCount > 99 ? '99+' : favoritesCount}
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* Language Selector */}
            <div className="h-9 px-2 flex items-center gap-1 bg-[#0d0e12] border border-[#20222c] hover:border-[#3a3d52] rounded-full shadow-sm transition-all">
              <button onClick={() => setLanguage('pt')} className={`w-5 h-5 rounded-full overflow-hidden border ${language === 'pt' ? 'border-[#FF0000] opacity-100 scale-105' : 'border-transparent opacity-40 hover:opacity-100'} transition-all cursor-pointer`} title="Português">
                <img src="https://flagcdn.com/br.svg" alt="Brasil" className="w-full h-full object-cover" />
              </button>
              <button onClick={() => setLanguage('en')} className={`w-5 h-5 rounded-full overflow-hidden border ${language === 'en' ? 'border-[#FF0000] opacity-100 scale-105' : 'border-transparent opacity-40 hover:opacity-100'} transition-all cursor-pointer`} title="English">
                <img src="https://flagcdn.com/us.svg" alt="USA" className="w-full h-full object-cover" />
              </button>
              <button onClick={() => setLanguage('es')} className={`w-5 h-5 rounded-full overflow-hidden border ${language === 'es' ? 'border-[#FF0000] opacity-100 scale-105' : 'border-transparent opacity-40 hover:opacity-100'} transition-all cursor-pointer`} title="Español">
                <img src="https://flagcdn.com/es.svg" alt="Spain" className="w-full h-full object-cover" />
              </button>
            </div>

            {loading ? (
              <div className="h-9 w-24 bg-[#0d0e12] border border-[#20222c] rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button className="h-9 px-2.5 pr-3.5 flex items-center gap-2 bg-[#0d0e12] border border-[#20222c] hover:bg-[#1a1c26] hover:border-[#3a3d52] text-gray-400 hover:text-white rounded-full transition-all shadow-sm cursor-pointer group">
                    <div className="w-5 h-5 rounded-full bg-[#1a1c26] flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-400 group-hover:text-white transition-colors truncate max-w-[100px]">
                      {profile?.username || profile?.email?.split('@')[0] || 'Usuário'}
                    </span>
                  </button>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <div className="bg-[#0d0e12] border border-[#252733] rounded-xl shadow-2xl p-2 min-w-[200px]">
                      <div className="px-3 py-2 border-b border-[#1f212a] mb-1.5">
                        <p className="text-[11px] text-gray-500">{t('logged_in_as')}</p>
                        <p className="text-xs font-semibold text-white truncate">{profile?.email || user?.email}</p>
                        <p className="text-[11px] text-[#FF0000] font-medium mt-0.5 capitalize">Role: {profile?.role || 'Nenhuma'}</p>
                      </div>
                      {profile?.role?.trim().toLowerCase() === 'admin' && (
                        <Link 
                          to="/painel" 
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-[#FF0000] hover:bg-[#1a1c26] rounded-lg transition-colors mb-0.5"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>{t('dashboard')}</span>
                        </Link>
                      )}
                      <Link 
                        to="/configuracoes" 
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-[#FF0000] hover:bg-[#1a1c26] rounded-lg transition-colors mb-0.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span>{t('settings') || 'Configurações'}</span>
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-[#1a1c26] rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button 
                  type="button"
                  onClick={() => openAuthModal('login')} 
                  className="h-9 px-4 flex items-center justify-center text-xs sm:text-sm font-semibold text-gray-300 hover:text-white bg-[#0d0e12] border border-[#20222c] hover:bg-[#1a1c26] hover:border-[#3a3d52] transition-all cursor-pointer rounded-full"
                >
                  {t('login')}
                </button>
                <button 
                  type="button"
                  onClick={() => openAuthModal('register')} 
                  className="h-9 px-4 flex items-center justify-center text-xs sm:text-sm font-semibold text-white bg-[#FF0000] border border-[#FF0000] hover:bg-[#ff3333] hover:border-[#ff3333] transition-all cursor-pointer rounded-full shadow-sm"
                >
                  {t('register')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
