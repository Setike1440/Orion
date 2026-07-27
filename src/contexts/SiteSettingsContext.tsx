import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface SiteSettings {
  site_name: string;
  logo_url: string;
  favicon_url: string;
  social_discord: string;
  social_instagram: string;
  social_twitter: string;
  social_youtube: string;
  support_email: string;
  seo_title: string;
  seo_description: string;
  primary_color: string;
}

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  estimated_end?: string;
}

export interface AnnouncementSettings {
  enabled: boolean;
  text: string;
  link_url?: string;
  icon: string;
  color: 'red' | 'amber' | 'emerald' | 'blue' | 'purple' | 'white';
  priority: 'normal' | 'high';
  expiration?: string;
}

export interface SystemErrorLog {
  id: string;
  timestamp: string;
  type: '404' | '500' | 'API' | 'DB' | 'CLIENT';
  message: string;
  url?: string;
  stack?: string;
  user_email?: string;
  status: 'pending' | 'resolved';
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  event_type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'SUSPICIOUS_IP' | 'BLOCKED_ACCESS' | 'ADMIN_ACTION';
  ip_address: string;
  user_email?: string;
  details: string;
  blocked?: boolean;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  user_email: string;
  username: string;
  device: string;
  browser: string;
  ip_address: string;
  last_active: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  maintenance: MaintenanceSettings;
  updateMaintenance: (newMaintenance: Partial<MaintenanceSettings>) => Promise<void>;
  announcement: AnnouncementSettings;
  updateAnnouncement: (newAnnouncement: Partial<AnnouncementSettings>) => Promise<void>;
  errorLogs: SystemErrorLog[];
  logError: (error: Omit<SystemErrorLog, 'id' | 'timestamp' | 'status'>) => void;
  resolveError: (id: string) => void;
  clearErrorLogs: () => void;
  securityEvents: SecurityEvent[];
  blockedIPs: string[];
  blockIP: (ip: string) => Promise<void>;
  unblockIP: (ip: string) => Promise<void>;
  clientIP: string;
  activeSessions: ActiveSession[];
  terminateSession: (sessionId: string) => Promise<void>;
  analytics: {
    pageViews: Record<string, number>;
    gameViews: Record<string, { title: string; views: number }>;
    totalFavorites: number;
    totalUsers: number;
  };
  refreshAnalytics: () => Promise<void>;
  trackPageView: (path: string) => void;
  trackGameView: (gameId: string, title: string) => void;
  runSystemCleanup: (options: { logs: boolean; errors: boolean; cache: boolean }) => Promise<number>;
  createFullBackup: () => Promise<any>;
  restoreFromBackup: (backupData: any) => Promise<boolean>;
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'Sirius',
  logo_url: 'https://i.ibb.co/kspXCrY6/Retangular.png',
  favicon_url: 'https://i.ibb.co/zW1gzQRR/Logo.png',
  social_discord: 'https://discord.gg',
  social_instagram: 'https://instagram.com',
  social_twitter: 'https://x.com',
  social_youtube: 'https://youtube.com',
  support_email: 'suporte@sirius.com',
  seo_title: 'Sirius',
  seo_description: 'Plataforma oficial de jogos e contas da comunidade Sirius.',
  primary_color: '#FF0000',
};

const DEFAULT_MAINTENANCE: MaintenanceSettings = {
  enabled: false,
  message: 'Estamos realizando uma manutenção preventiva no sistema para melhorar sua experiência. Voltamos em breve!',
  estimated_end: '1 a 2 horas',
};

const DEFAULT_ANNOUNCEMENT: AnnouncementSettings = {
  enabled: true,
  text: 'Novas contas adicionadas hoje! Aproveite e salve seus jogos favoritos.',
  link_url: '/sugerir-jogo',
  icon: 'Sparkles',
  color: 'red',
  priority: 'normal',
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, signOut } = useAuth();

  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('orion_site_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const [maintenance, setMaintenance] = useState<MaintenanceSettings>(() => {
    try {
      const saved = localStorage.getItem('orion_maintenance_settings');
      return saved ? { ...DEFAULT_MAINTENANCE, ...JSON.parse(saved) } : DEFAULT_MAINTENANCE;
    } catch (e) {
      return DEFAULT_MAINTENANCE;
    }
  });

  const [announcement, setAnnouncement] = useState<AnnouncementSettings>(() => {
    try {
      const saved = localStorage.getItem('orion_announcement_settings');
      return saved ? { ...DEFAULT_ANNOUNCEMENT, ...JSON.parse(saved) } : DEFAULT_ANNOUNCEMENT;
    } catch (e) {
      return DEFAULT_ANNOUNCEMENT;
    }
  });

  const [errorLogs, setErrorLogs] = useState<SystemErrorLog[]>(() => {
    try {
      const saved = localStorage.getItem('orion_error_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(() => {
    try {
      const saved = localStorage.getItem('orion_security_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [blockedIPs, setBlockedIPs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('orion_blocked_ips');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [clientIP, setClientIP] = useState<string>('189.122.45.10');
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  const [analytics, setAnalytics] = useState(() => {
    try {
      const saved = localStorage.getItem('site_analytics_cache_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      pageViews: {} as Record<string, number>,
      gameViews: {} as Record<string, { title: string; views: number }>,
      totalFavorites: 0,
      totalUsers: 0,
    };
  });

  // Detect Client IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        if (data.ip) setClientIP(data.ip);
      })
      .catch(() => {
        setClientIP('189.122.45.10');
      });
  }, []);

  // 1. Initial Supabase Fetch & Realtime Subscription
  useEffect(() => {
    const sanitizeName = (val?: string) => {
      if (!val || val.toLowerCase().includes('orion') || val.includes('Contas Steam')) return 'Sirius';
      return val;
    };
    const sanitizeLogo = (val?: string) => {
      if (!val || val.includes('0a36M0M') || val === 'https://i.ibb.co/zW1gzQRR/Logo.png') return 'https://i.ibb.co/kspXCrY6/Retangular.png';
      return val;
    };
    const sanitizeText = (val?: string) => {
      if (!val) return val;
      return val.replace(/Orion Games/g, 'Sirius').replace(/Orion/g, 'Sirius');
    };
    const sanitizeSeoTitle = (val?: string) => {
      if (!val || val.toLowerCase().includes('orion') || val.includes('Contas Steam')) return 'Sirius';
      return sanitizeText(val);
    };

    const fetchSiteSettings = async () => {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
        if (data && !error) {
          if (data.site_name) {
            setSettings(prev => ({
              ...prev,
              site_name: sanitizeName(data.site_name),
              logo_url: sanitizeLogo(data.logo_url),
              favicon_url: data.favicon_url || prev.favicon_url,
              social_discord: data.social_discord || prev.social_discord,
              social_instagram: data.social_instagram || prev.social_instagram,
              social_twitter: data.social_twitter || prev.social_twitter,
              social_youtube: data.social_youtube || prev.social_youtube,
              support_email: sanitizeText(data.support_email) || prev.support_email,
              seo_title: sanitizeSeoTitle(data.seo_title),
              seo_description: sanitizeText(data.seo_description) || prev.seo_description,
              primary_color: data.primary_color || prev.primary_color,
            }));
          }
          if (data.maintenance) {
            setMaintenance(prev => ({ ...DEFAULT_MAINTENANCE, ...prev, ...data.maintenance }));
          }
          if (data.announcement) {
            setAnnouncement(prev => {
              const merged = { ...DEFAULT_ANNOUNCEMENT, ...prev, ...data.announcement };
              if (!merged.link_url) {
                merged.link_url = prev.link_url || DEFAULT_ANNOUNCEMENT.link_url || '/sugerir-jogo';
              }
              return merged;
            });
          }
        }
      } catch (e) {}
    };

    const settingsChannel = supabase
      .channel('site_settings_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
        if (payload.new) {
          const data = payload.new as any;
          if (data.site_name) {
            setSettings(prev => ({
              ...prev,
              site_name: sanitizeName(data.site_name),
              logo_url: sanitizeLogo(data.logo_url),
              favicon_url: data.favicon_url || prev.favicon_url,
              social_discord: data.social_discord || prev.social_discord,
              social_instagram: data.social_instagram || prev.social_instagram,
              social_twitter: data.social_twitter || prev.social_twitter,
              social_youtube: data.social_youtube || prev.social_youtube,
              support_email: sanitizeText(data.support_email) || prev.support_email,
              seo_title: sanitizeSeoTitle(data.seo_title),
              seo_description: sanitizeText(data.seo_description) || prev.seo_description,
              primary_color: data.primary_color || prev.primary_color,
            }));
          }
          if (data.maintenance) setMaintenance(prev => ({ ...DEFAULT_MAINTENANCE, ...prev, ...data.maintenance }));
          if (data.announcement) setAnnouncement(prev => {
            const merged = { ...DEFAULT_ANNOUNCEMENT, ...prev, ...data.announcement };
            if (!merged.link_url) {
              merged.link_url = prev.link_url || DEFAULT_ANNOUNCEMENT.link_url || '/sugerir-jogo';
            }
            return merged;
          });
        }
      })
      .subscribe();

    const fetchBlockedIPs = async () => {
      try {
        const { data } = await supabase.from('blocked_ips').select('ip_address');
        if (data) {
          setBlockedIPs(data.map(d => d.ip_address));
        }
      } catch (e) {}
    };

    const fetchErrorLogs = async () => {
      try {
        const { data } = await supabase.from('error_logs').select('*').order('created_at', { ascending: false }).limit(50);
        if (data) {
          setErrorLogs(data.map(d => ({
            id: d.id,
            timestamp: d.created_at || d.timestamp || new Date().toISOString(),
            type: d.type || 'CLIENT',
            message: d.message,
            url: d.url,
            user_email: d.user_email,
            status: d.status || 'pending'
          })));
        }
      } catch (e) {}
    };

    const fetchSecurityEvents = async () => {
      try {
        const { data } = await supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(50);
        if (data) {
          setSecurityEvents(data.map(d => ({
            id: d.id,
            timestamp: d.created_at || d.timestamp || new Date().toISOString(),
            event_type: d.event_type || 'LOGIN_SUCCESS',
            ip_address: d.ip_address || '127.0.0.1',
            user_email: d.user_email,
            details: d.details || '',
            blocked: d.blocked || false
          })));
        }
      } catch (e) {}
    };

    const fetchAnalytics = async () => {
      try {
        const { count: favsCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true });
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { data: pageData } = await supabase.from('page_views').select('path, views');
        const { data: gameData } = await supabase.from('games').select('id, title, views_count');

        setAnalytics(prev => {
          const pageViewsMap: Record<string, number> = { ...prev.pageViews };
          if (pageData && pageData.length > 0) {
            pageData.forEach(p => {
              if (p.path) {
                pageViewsMap[p.path] = Math.max(p.views || 0, pageViewsMap[p.path] || 0);
              }
            });
          }

          const gameViewsMap: Record<string, { title: string; views: number }> = { ...prev.gameViews };
          if (gameData && gameData.length > 0) {
            gameData.forEach(g => {
              if ((g.views_count || 0) > 0) {
                gameViewsMap[g.id] = {
                  title: g.title || gameViewsMap[g.id]?.title || 'Jogo',
                  views: Math.max(g.views_count || 0, gameViewsMap[g.id]?.views || 0)
                };
              }
            });
          }

          const updated = {
            totalFavorites: Math.max(favsCount ?? 0, prev.totalFavorites),
            totalUsers: Math.max(usersCount ?? 0, prev.totalUsers),
            pageViews: pageViewsMap,
            gameViews: gameViewsMap
          };

          try {
            localStorage.setItem('site_analytics_cache_v4', JSON.stringify(updated));
          } catch(e) {}

          return updated;
        });
      } catch (e) {}
    };

    const analyticsChannel = supabase
      .channel('analytics_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, () => fetchAnalytics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_views' }, () => fetchAnalytics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, () => fetchAnalytics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAnalytics())
      .subscribe();

    fetchSiteSettings();
    fetchBlockedIPs();
    fetchErrorLogs();
    fetchSecurityEvents();
    fetchAnalytics();

    const handleFavUpdated = () => fetchAnalytics();
    window.addEventListener('favorites-updated', handleFavUpdated);

    const analyticsInterval = setInterval(() => {
      fetchAnalytics();
    }, 3000);

    return () => {
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(analyticsChannel);
      window.removeEventListener('favorites-updated', handleFavUpdated);
      clearInterval(analyticsInterval);
    };
  }, []);

  // Fetch and Monitor Active Sessions
  const refreshActiveSessions = async () => {
    try {
      const { data } = await supabase.from('active_sessions').select('*').order('last_active', { ascending: false });
      if (data) {
        setActiveSessions(data.map(s => ({
          id: s.id,
          user_id: s.user_id,
          user_email: s.user_email || '',
          username: s.username || s.user_email?.split('@')[0] || 'Usuário',
          device: s.device || 'Desktop',
          browser: s.browser || 'Navegador Web',
          ip_address: s.ip_address || '127.0.0.1',
          last_active: 'Ativo agora'
        })));
      }
    } catch (e) {}
  };

  useEffect(() => {
    refreshActiveSessions();
    const interval = setInterval(refreshActiveSessions, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update SEO Document Title and Favicon dynamically
  useEffect(() => {
    if (settings.seo_title) {
      document.title = settings.seo_title;
    }
    if (settings.favicon_url) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.favicon_url;
    }
  }, [settings]);

  // Handle Active User Session Registration and LIVE Session Termination Check
  useEffect(() => {
    if (!user) return;
    const currentSession: ActiveSession = {
      id: `sess-${user.id}`,
      user_id: user.id,
      user_email: user.email || '',
      username: profile?.username || user.email?.split('@')[0] || 'Usuário',
      device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Navegador Web',
      ip_address: clientIP,
      last_active: 'Agora mesmo'
    };

    // Register active session in Supabase (upsert)
    const registerSession = async () => {
      try {
        await supabase.from('active_sessions').upsert([{
          id: `sess-${user.id}`,
          user_id: user.id,
          user_email: user.email,
          username: profile?.username || user.email,
          device: currentSession.device,
          browser: currentSession.browser,
          ip_address: clientIP,
          last_active: new Date().toISOString()
        }]);
        refreshActiveSessions();
      } catch (e) {}
    };
    registerSession();

    // Polling check if user's active session was marked as terminated locally or explicitly deleted by admin
    const checkTermination = setInterval(async () => {
      try {
        const terminatedLocally = localStorage.getItem(`session_terminated_${user.id}`);
        if (terminatedLocally) {
          localStorage.removeItem(`session_terminated_${user.id}`);
          await signOut();
          alert('Sua sessão foi encerrada pela administração.');
          return;
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(checkTermination);
  }, [user, profile, clientIP, signOut]);

  // Global Error Listener
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      logError({
        type: 'CLIENT',
        message: event.message || 'Erro de execução JavaScript no cliente',
        url: window.location.pathname,
        stack: event.error?.stack
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError({
        type: 'API',
        message: `Promessa não tratada: ${event.reason?.message || event.reason}`,
        url: window.location.pathname
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('orion_site_settings', JSON.stringify(settings));
    localStorage.setItem('orion_maintenance_settings', JSON.stringify(maintenance));
    localStorage.setItem('orion_announcement_settings', JSON.stringify(announcement));
    localStorage.setItem('orion_error_logs', JSON.stringify(errorLogs));
    localStorage.setItem('orion_security_events', JSON.stringify(securityEvents));
    localStorage.setItem('orion_blocked_ips', JSON.stringify(blockedIPs));
  }, [settings, maintenance, announcement, errorLogs, securityEvents, blockedIPs]);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await supabase.from('site_settings').upsert([{ 
        id: 1, 
        site_name: updated.site_name,
        logo_url: updated.logo_url,
        favicon_url: updated.favicon_url,
        social_discord: updated.social_discord,
        social_instagram: updated.social_instagram,
        social_twitter: updated.social_twitter,
        social_youtube: updated.social_youtube,
        support_email: updated.support_email,
        seo_title: updated.seo_title,
        seo_description: updated.seo_description,
        primary_color: updated.primary_color,
        maintenance: maintenance,
        announcement: announcement,
        updated_at: new Date().toISOString()
      }]);
    } catch (e) {
      console.error('Error updating settings:', e);
    }
  };

  const updateMaintenance = async (newMaint: Partial<MaintenanceSettings>) => {
    const updated = { ...maintenance, ...newMaint };
    setMaintenance(updated);
    try {
      await supabase.from('site_settings').upsert([{ 
        id: 1, 
        site_name: settings.site_name,
        logo_url: settings.logo_url,
        favicon_url: settings.favicon_url,
        social_discord: settings.social_discord,
        social_instagram: settings.social_instagram,
        social_twitter: settings.social_twitter,
        social_youtube: settings.social_youtube,
        support_email: settings.support_email,
        seo_title: settings.seo_title,
        seo_description: settings.seo_description,
        primary_color: settings.primary_color,
        maintenance: updated,
        announcement: announcement,
        updated_at: new Date().toISOString()
      }]);
    } catch (e) {
      console.error('Error updating maintenance:', e);
    }
  };

  const updateAnnouncement = async (newAnn: Partial<AnnouncementSettings>) => {
    const updated = { ...announcement, ...newAnn };
    setAnnouncement(updated);
    try {
      await supabase.from('site_settings').upsert([{ 
        id: 1, 
        site_name: settings.site_name,
        logo_url: settings.logo_url,
        favicon_url: settings.favicon_url,
        social_discord: settings.social_discord,
        social_instagram: settings.social_instagram,
        social_twitter: settings.social_twitter,
        social_youtube: settings.social_youtube,
        support_email: settings.support_email,
        seo_title: settings.seo_title,
        seo_description: settings.seo_description,
        primary_color: settings.primary_color,
        maintenance: maintenance,
        announcement: updated,
        updated_at: new Date().toISOString()
      }]);
    } catch (e) {
      console.error('Error updating announcement:', e);
    }
  };

  const logError = async (error: Omit<SystemErrorLog, 'id' | 'timestamp' | 'status'>) => {
    const newLog: SystemErrorLog = {
      ...error,
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      user_email: user?.email,
      status: 'pending'
    };
    setErrorLogs(prev => [newLog, ...prev]);

    try {
      await supabase.from('error_logs').insert([{
        id: newLog.id,
        type: newLog.type,
        message: newLog.message,
        url: newLog.url,
        user_email: newLog.user_email,
        status: 'pending',
        created_at: newLog.timestamp
      }]);
    } catch (e) {}
  };

  const resolveError = async (id: string) => {
    setErrorLogs(prev => prev.map(e => e.id === id ? { ...e, status: 'resolved' } : e));
    try {
      await supabase.from('error_logs').update({ status: 'resolved' }).eq('id', id);
    } catch (e) {}
  };

  const clearErrorLogs = async () => {
    setErrorLogs([]);
    try {
      await supabase.from('error_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (e) {}
  };

  const blockIP = async (ip: string) => {
    if (!blockedIPs.includes(ip)) {
      const updatedBlocked = [...blockedIPs, ip];
      setBlockedIPs(updatedBlocked);
      const secEvent: SecurityEvent = {
        id: `sec-${Date.now()}`,
        timestamp: new Date().toISOString(),
        event_type: 'BLOCKED_ACCESS',
        ip_address: ip,
        user_email: user?.email,
        details: 'IP bloqueado manualmente pelo administrador',
        blocked: true
      };
      setSecurityEvents(prev => [secEvent, ...prev]);

      try {
        await supabase.from('blocked_ips').insert([{ ip_address: ip, reason: 'Manual Block' }]);
        await supabase.from('security_events').insert([{
          id: secEvent.id,
          event_type: secEvent.event_type,
          ip_address: secEvent.ip_address,
          user_email: secEvent.user_email,
          details: secEvent.details,
          blocked: true,
          created_at: secEvent.timestamp
        }]);
      } catch (e) {}
    }
  };

  const unblockIP = async (ip: string) => {
    setBlockedIPs(prev => prev.filter(i => i !== ip));
    try {
      await supabase.from('blocked_ips').delete().eq('ip_address', ip);
    } catch (e) {}
  };

  const terminateSession = async (sessionId: string) => {
    const targetSession = activeSessions.find(s => s.id === sessionId);
    if (targetSession) {
      localStorage.setItem(`session_terminated_${targetSession.user_id}`, 'true');
    }
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));

    try {
      await supabase.from('active_sessions').delete().eq('id', sessionId);
      if (targetSession) {
        await supabase.from('active_sessions').delete().eq('user_id', targetSession.user_id);
      }
    } catch (e) {}
  };

  const refreshAnalytics = async () => {
    try {
      const { count: favsCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true });
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { data: pageData } = await supabase.from('page_views').select('path, views');
      const { data: gameData } = await supabase.from('games').select('id, title, views_count');

      setAnalytics(prev => {
        const pageViewsMap: Record<string, number> = { ...prev.pageViews };
        if (pageData && pageData.length > 0) {
          pageData.forEach(p => {
            if (p.path) pageViewsMap[p.path] = Math.max(p.views || 0, pageViewsMap[p.path] || 0);
          });
        }

        const gameViewsMap: Record<string, { title: string; views: number }> = { ...prev.gameViews };
        if (gameData && gameData.length > 0) {
          gameData.forEach(g => {
            if ((g.views_count || 0) > 0) {
              gameViewsMap[g.id] = {
                title: g.title || gameViewsMap[g.id]?.title || 'Jogo',
                views: Math.max(g.views_count || 0, gameViewsMap[g.id]?.views || 0)
              };
            }
          });
        }

        const updated = {
          totalFavorites: Math.max(favsCount ?? 0, prev.totalFavorites),
          totalUsers: Math.max(usersCount ?? 0, prev.totalUsers),
          pageViews: pageViewsMap,
          gameViews: gameViewsMap
        };

        try {
          localStorage.setItem('site_analytics_cache_v4', JSON.stringify(updated));
        } catch(e) {}

        return updated;
      });
    } catch (e) {}
  };

  const trackPageView = async (path: string) => {
    if (!path) return;
    setAnalytics(prev => {
      const current = prev.pageViews[path] || 0;
      const updated = {
        ...prev,
        pageViews: {
          ...prev.pageViews,
          [path]: current + 1
        }
      };
      try {
        localStorage.setItem('site_analytics_cache_v4', JSON.stringify(updated));
      } catch(e) {}
      return updated;
    });

    try {
      const { data } = await supabase.from('page_views').select('views').eq('path', path).maybeSingle();
      if (data) {
        await supabase.from('page_views').update({ views: (data.views || 0) + 1 }).eq('path', path);
      } else {
        await supabase.from('page_views').insert([{ path, views: 1 }]);
      }
    } catch (e) {
      try {
        await supabase.rpc('increment_page_views', { page_path: path });
      } catch (err) {}
    }
  };

  const trackGameView = async (gameId: string, title: string) => {
    if (!gameId) return;
    setAnalytics(prev => {
      const currentViews = prev.gameViews[gameId]?.views || 0;
      const updated = {
        ...prev,
        gameViews: {
          ...prev.gameViews,
          [gameId]: {
            title: title || prev.gameViews[gameId]?.title || 'Jogo',
            views: currentViews + 1
          }
        }
      };
      try {
        localStorage.setItem('site_analytics_cache_v4', JSON.stringify(updated));
      } catch(e) {}
      return updated;
    });

    try {
      const { data } = await supabase.from('games').select('views_count').eq('id', gameId).maybeSingle();
      if (data) {
        await supabase.from('games').update({ views_count: (data.views_count || 0) + 1 }).eq('id', gameId);
      }
    } catch (e) {
      try {
        await supabase.rpc('increment_game_views', { game_uuid: gameId });
      } catch (err) {}
    }
  };

  const runSystemCleanup = async (options: { logs: boolean; errors: boolean; cache: boolean }) => {
    let itemsCleaned = 0;
    if (options.errors) {
      const resolvedCount = errorLogs.filter(e => e.status === 'resolved').length;
      itemsCleaned += resolvedCount;
      setErrorLogs(prev => prev.filter(e => e.status !== 'resolved'));
      try {
        await supabase.from('error_logs').delete().eq('status', 'resolved');
      } catch (e) {}
    }
    if (options.cache) {
      itemsCleaned += 10;
      localStorage.removeItem('orion_temp_cache');
      sessionStorage.clear();
    }
    if (options.logs) {
      const oldEventsCount = securityEvents.length;
      itemsCleaned += oldEventsCount;
      setSecurityEvents([]);
      try {
        await supabase.from('activity_logs').delete().lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        await supabase.from('security_events').delete().lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      } catch (e) {}
    }
    return itemsCleaned;
  };

  const createFullBackup = async () => {
    let games = [];
    let categories = [];
    let profiles = [];
    let suggestions = [];
    let logs = [];

    try {
      const { data: g } = await supabase.from('games').select('*');
      if (g) games = g;
      const { data: c } = await supabase.from('categories').select('*');
      if (c) categories = c;
      const { data: p } = await supabase.from('profiles').select('*');
      if (p) profiles = p;
      const { data: s } = await supabase.from('suggestions').select('*');
      if (s) suggestions = s;
      const { data: l } = await supabase.from('activity_logs').select('*');
      if (l) logs = l;
    } catch (e) {}

    return {
      exported_at: new Date().toISOString(),
      version: '2.0.0',
      settings,
      maintenance,
      announcement,
      blockedIPs,
      errorLogs,
      securityEvents,
      analytics,
      database: {
        games,
        categories,
        profiles,
        suggestions,
        activity_logs: logs
      }
    };
  };

  const restoreFromBackup = async (data: any): Promise<boolean> => {
    try {
      if (data.settings) setSettings(data.settings);
      if (data.maintenance) setMaintenance(data.maintenance);
      if (data.announcement) setAnnouncement(data.announcement);
      if (data.blockedIPs) setBlockedIPs(data.blockedIPs);
      if (data.errorLogs) setErrorLogs(data.errorLogs);

      if (data.settings) {
        await supabase.from('site_settings').upsert([{ id: 1, ...data.settings, maintenance: data.maintenance, announcement: data.announcement }]);
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        maintenance,
        updateMaintenance,
        announcement,
        updateAnnouncement,
        errorLogs,
        logError,
        resolveError,
        clearErrorLogs,
        securityEvents,
        blockedIPs,
        blockIP,
        unblockIP,
        clientIP,
        activeSessions,
        terminateSession,
        analytics,
        refreshAnalytics,
        trackPageView,
        trackGameView,
        runSystemCleanup,
        createFullBackup,
        restoreFromBackup
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
