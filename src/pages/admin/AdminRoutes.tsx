import React, { useState } from 'react';
import { Routes, Route, Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Skeleton } from '../../components/Skeleton';
import { 
  LayoutDashboard, Users, Gamepad2, ScrollText, ArrowLeft, LogOut, Shield, 
  MessageSquarePlus, ChevronLeft, ChevronRight, BarChart3, Settings, Wrench, 
  Database, Lock, Globe, Bug, Megaphone, Sparkles
} from 'lucide-react';
import { DashboardHome } from './DashboardHome';
import { GamesManager } from './GamesManager';
import { UsersManager } from './UsersManager';
import { LogsManager } from './LogsManager';
import { SuggestionsManager } from './SuggestionsManager';
import { AnalyticsManager } from './AnalyticsManager';
import { SettingsManager } from './SettingsManager';
import { MaintenanceManager } from './MaintenanceManager';
import { BackupManager } from './BackupManager';
import { SecurityCenter } from './SecurityCenter';
import { ActiveSessionsManager } from './ActiveSessionsManager';
import { ErrorMonitoringManager } from './ErrorMonitoringManager';
import { DatabaseManager } from './DatabaseManager';
import { AnnouncementManager } from './AnnouncementManager';
import { SystemCleanupManager } from './SystemCleanupManager';

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
    { name: t('admin_users'), path: '/admin/users', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Barra de Avisos', path: '/admin/announcement', icon: Megaphone },
    { name: 'Configurações', path: '/admin/settings', icon: Settings },
    { name: 'Manutenção', path: '/admin/maintenance', icon: Wrench },
    { name: 'Backup', path: '/admin/backup', icon: Database },
    { name: 'Segurança', path: '/admin/security', icon: Lock },
    { name: 'Sessões Ativas', path: '/admin/sessions', icon: Globe },
    { name: 'Erros do Sistema', path: '/admin/errors', icon: Bug },
    { name: 'Banco de Dados', path: '/admin/database', icon: Database },
    { name: 'Limpeza do Sistema', path: '/admin/system-cleanup', icon: Sparkles },
    { name: t('admin_logs'), path: '/admin/logs', icon: ScrollText },
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
      <aside className={`w-full ${isCollapsed ? 'md:w-20' : 'md:w-64'} bg-[#0d0e12] border-b md:border-b-0 md:border-r border-[#1f212a] flex flex-col justify-between shrink-0 transition-all duration-300 relative z-20`}>
        {/* Toggle Button centered on the border between sidebar and main content */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#181920] border border-[#20222c] text-gray-300 hover:text-white hover:bg-[#FF0000] hover:border-[#FF0000] shadow-lg items-center justify-center transition-all cursor-pointer z-30"
          title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Header Title */}
          <div className="flex items-center gap-3 px-1 min-w-0">
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

          {/* Line below sidebar title */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#252733] to-transparent my-2" />

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const itemPath = item.path;
              const isActive = itemPath === '/admin' 
                ? isDashboardPath
                : currentPath.startsWith(itemPath) || currentPath.startsWith(itemPath.replace('/admin', '/painel'));

              return (
                <Link
                  key={itemPath}
                  to={itemPath}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-medium transition-all ${
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
        <div className="p-4 sm:p-5 pt-3 space-y-2">
          {/* Gradient Divider Line above Voltar ao site button */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#252733] to-transparent mb-3" />

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
        <Route path="analytics" element={<AnalyticsManager />} />
        <Route path="settings" element={<SettingsManager />} />
        <Route path="maintenance" element={<MaintenanceManager />} />
        <Route path="backup" element={<BackupManager />} />
        <Route path="security" element={<SecurityCenter />} />
        <Route path="sessions" element={<ActiveSessionsManager />} />
        <Route path="errors" element={<ErrorMonitoringManager />} />
        <Route path="database" element={<DatabaseManager />} />
        <Route path="announcement" element={<AnnouncementManager />} />
        <Route path="system-cleanup" element={<SystemCleanupManager />} />
        <Route path="logs" element={<LogsManager />} />
      </Route>
    </Routes>
  );
};

