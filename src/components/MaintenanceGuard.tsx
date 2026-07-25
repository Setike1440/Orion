import React from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, Shield, ArrowRight, Clock, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { maintenance, settings, blockedIPs, clientIP } = useSiteSettings();
  const { profile } = useAuth();
  const location = useLocation();

  const isAdmin = profile?.role?.trim().toLowerCase() === 'admin';
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/painel');

  const isIPBlocked = blockedIPs.includes(clientIP);

  // 1. IP Ban Guard Check
  if (isIPBlocked && !isAdminPath) {
    return (
      <div className="min-h-screen w-full bg-[#000000] text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF0000]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-lg w-full bg-[#0d0e12] border border-[#FF0000]/30 rounded-3xl p-8 text-center shadow-2xl relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/30 flex items-center justify-center text-[#FF0000] mx-auto">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Acesso Bloqueado</h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
              Seu endereço de IP <span className="font-mono text-white bg-[#181920] px-2 py-0.5 rounded border border-[#20222c]">{clientIP}</span> foi bloqueado pela administração do site.
            </p>
          </div>

          <p className="text-[11px] text-gray-500 pt-4 border-t border-[#1f212a]">
            Se você é o administrador ou acredita que isto foi um engano, entre em contato através de{' '}
            <span className="text-gray-300 font-semibold">{settings.support_email}</span>.
          </p>
        </div>
      </div>
    );
  }

  // 2. Maintenance Mode Guard Check
  if (maintenance.enabled && !isAdmin && !isAdminPath) {
    return (
      <div className="min-h-screen w-full bg-[#000000] text-white flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF0000]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-lg w-full bg-[#0d0e12] border border-[#1f212a] rounded-3xl p-8 text-center shadow-2xl relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/30 flex items-center justify-center text-[#FF0000] mx-auto">
            <Wrench className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">{settings.site_name} em Manutenção</h1>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
              {maintenance.message}
            </p>
          </div>

          {maintenance.estimated_end && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#181920] border border-[#20222c] rounded-full text-xs text-amber-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Tempo estimado: {maintenance.estimated_end}</span>
            </div>
          )}

          <div className="pt-4 border-t border-[#1f212a] flex items-center justify-center gap-4">
            <Link 
              to="/painel" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#FF0000]" />
              <span>Acesso Administrativo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
