import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

export const NotificationBell = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // A simple notification sound (using a reliable data URI for a short ping)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Create audio element
    audioRef.current = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'); // Mock valid placeholder, but let's use a real sound url or generate a tiny beep using AudioContext instead to be safe.
    
    fetchNotifications();

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setNotifications(data);
    }
  };

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.log('Audio play failed', e);
    }
  };

  if (!user) return null;

  return (
    <div 
      className="relative flex items-center justify-center h-full"
      onMouseEnter={() => {
        setShowDropdown(true);
        setUnreadCount(0);
      }}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <button 
        type="button"
        className="w-9 h-9 rounded-full bg-[#121318] border border-[#20222c] hover:border-[#268FFF] text-gray-400 hover:text-white flex items-center justify-center transition-all shadow-sm relative cursor-pointer"
        title={t('notifications')}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#121318]"></span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-[100%] mt-2 w-80 bg-[#121318] border border-[#1f212a] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1f212a] flex justify-between items-center bg-[#181920]">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">{t('notifications')}</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs">
                {t('no_notifications')}
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="p-3.5 border-b border-[#1f212a] hover:bg-[#1f212c]/50 transition-colors">
                  <h4 className="text-xs font-medium text-white mb-1">{notif.title}</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
