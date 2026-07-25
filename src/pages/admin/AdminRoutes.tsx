import React, { useState } from 'react';
import { Routes, Route, Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Skeleton } from '../../components/Skeleton';
import { LayoutDashboard, Users, Gamepad2, ScrollText, ArrowLeft, LogOut, Shield, MessageSquarePlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardHome } from './DashboardHome';
import { GamesManager } from './GamesManager';
import { UsersManager } from './UsersManager';
import { LogsManager } from './LogsManager';
import { SuggestionsManager } from './SuggestionsManager';

const AdminLayout = () => {
  const { profile, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (profile?.role?.trim().toLowerCase() !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: t('admin_dashboard'), path: '/admin', icon: LayoutDashboard },
    { name: t('admin_games'), path: '/admin/games', icon: Gamepad2 },
    { name: 'Sugestões', path: '/admin/suggestions', icon: MessageSquarePlus },
    { name: t('admin_users'), path: t('admin_users_soon'), pathReal: '/admin/users', icon: Users },
    { name: t('admin_logs'), path: t('admin_logs_soon'), pathReal: '/admin/logs', icon: ScrollText },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const currentPath = location.pathname;
  const isDashboardPath = currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/painel' || currentPath === '/painel/';

  return (
    <div className="h-screen bg-[#000000] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-full ${isCollapsed ? 'md:w-20' : 'md:w-64'} bg-[#0d0e12] border-b md:border-b-0 md:border-r border-[#1f212a] flex flex-col justify-between shrink-0 p-4 sm:p-5 md:h-screen overflow-y-auto transition-all duration-300 relative`}>
        <div className="space-y-4">
          
          {/* Header Title & Collapse Toggle */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/30 flex items-center justify-center text-[#FF0000] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white tracking-wide truncate">{t('admin_title')}</h2>
                  <p className="text-[10px] text-gray-400 font-mono truncate">Painel de Controle</p>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-[#181920] border border-[#20222c] text-gray-400 hover:text-white hover:bg-[#20222c] transition-all cursor-pointer shrink-0"
              title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Line below sidebar title */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#252733] to-transparent my-2" />

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const itemPath = item.pathReal || item.path;
              const isActive = itemPath === '/admin' 
                ? isDashboardPath
                : currentPath.startsWith(itemPath) || currentPath.startsWith(itemPath.replace('/admin', '/painel'));

              return (
                <Link
                  key={itemPath}
                  to={itemPath}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-[#FF0000] text-white font-semibold shadow-sm' 
                      : 'text-gray-400 hover:text-white hover:bg-[#181920]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 mt-6 border-t border-[#1f212a] space-y-2">
          <Link
            to="/"
            title={t('back_to_site')}
            className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-black bg-white hover:bg-gray-100 transition-all cursor-pointer shadow-sm`}
          >
            <ArrowLeft className="w-4 h-4 text-black shrink-0" />
            {!isCollapsed && <span className="text-black font-semibold truncate">{t('back_to_site')}</span>}
          </Link>

          <button
            onClick={handleLogout}
            title={isCollapsed ? t('logout') : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#FF0000] hover:bg-[#d60000] transition-all cursor-pointer shadow-sm`}
          >
            <LogOut className="w-4 h-4 text-white shrink-0" />
            {!isCollapsed && <span className="truncate">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#000000] p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="games" element={<GamesManager />} />
        <Route path="suggestions" element={<SuggestionsManager />} />
        <Route path="users" element={<UsersManager />} />
        <Route path="logs" element={<LogsManager />} />
      </Route>
    </Routes>
  );
};
