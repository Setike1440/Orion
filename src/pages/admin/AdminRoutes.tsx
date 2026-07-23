import React from 'react';
import { Routes, Route, Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LayoutDashboard, Users, Gamepad2, ScrollText, ArrowLeft, LogOut, Shield } from 'lucide-react';
import { DashboardHome } from './DashboardHome';
import { GamesManager } from './GamesManager';
import { UsersManager } from './UsersManager';
import { LogsManager } from './LogsManager';

const AdminLayout = () => {
  const { profile, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return null;

  if (profile?.role?.trim().toLowerCase() !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: t('admin_dashboard'), path: '/admin', icon: LayoutDashboard },
    { name: t('admin_games'), path: '/admin/games', icon: Gamepad2 },
    { name: t('admin_users'), path: t('admin_users_soon'), pathReal: '/admin/users', icon: Users },
    { name: t('admin_logs'), path: t('admin_logs_soon'), pathReal: '/admin/logs', icon: ScrollText },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="h-screen bg-[#0a0b0e] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#060608] border-b md:border-b-0 md:border-r border-[#1f212a] flex flex-col justify-between shrink-0 p-4 sm:p-6 md:h-screen overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-[#268FFF]/10 border border-[#268FFF]/30 flex items-center justify-center text-[#268FFF]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">{t('admin_title')}</h2>
              <p className="text-[10px] text-gray-400 font-mono">Painel de Controle</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const itemPath = item.pathReal || item.path;
              const isActive = itemPath === '/admin' 
                ? (location.pathname === '/admin' || location.pathname === '/admin/')
                : location.pathname.startsWith(itemPath);

              return (
                <Link
                  key={itemPath}
                  to={itemPath}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-[#268FFF] text-white font-semibold shadow-sm' 
                      : 'text-gray-400 hover:text-white hover:bg-[#121318]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-6 mt-6 border-t border-[#1f212a] space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-200 bg-[#121318] hover:bg-[#1a1c23] border border-[#1f212a] transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#268FFF]" />
            <span>{t('back_to_site')}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#0a0b0e] p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto">
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
        <Route path="users" element={<UsersManager />} />
        <Route path="logs" element={<LogsManager />} />
      </Route>
    </Routes>
  );
};
