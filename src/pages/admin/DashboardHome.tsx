import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Gamepad2, Users, ScrollText, TrendingUp, BellRing, Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const DashboardHome = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ games: 0, users: 0, logs: 0 });
  const [loading, setLoading] = useState(true);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [{ count: games }, { count: users }, { count: logs }] = await Promise.all([
        supabase.from('games').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('logs').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        games: games || 0,
        users: users || 0,
        logs: logs || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;
    
    setSendingNotif(true);
    try {
      const { error } = await supabase.from('notifications').insert([
        { title: notifTitle, message: notifMessage }
      ]);
      if (error) throw error;
      
      setNotifTitle('');
      setNotifMessage('');
      alert(t('admin_notif_success'));
    } catch (error: any) {
      alert(t('admin_notif_err') + error.message);
    } finally {
      setSendingNotif(false);
    }
  };

  const statCards = [
    { title: t('admin_total_games'), value: stats.games, icon: Gamepad2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: t('admin_registered_users'), value: stats.users, icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: t('admin_log_records'), value: stats.logs, icon: ScrollText, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">{t('admin_overview')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">{stat.title}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">{loading ? '...' : stat.value}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <TrendingUp className="w-10 h-10 text-gray-500 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1.5">{t('admin_welcome_dashboard')}</h3>
          <p className="text-gray-400 text-xs sm:text-sm max-w-sm leading-relaxed">
            {t('admin_dashboard_desc')}
          </p>
        </div>

        <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('admin_send_notif')}</h3>
              <p className="text-xs text-gray-400">{t('admin_notif_desc')}</p>
            </div>
          </div>

          <form onSubmit={sendNotification} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder={t('admin_notif_title')}
                required
                value={notifTitle}
                onChange={e => setNotifTitle(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-white focus:border-[#268FFF] outline-none text-xs sm:text-sm"
              />
            </div>
            <div>
              <textarea 
                placeholder={t('admin_notif_msg')}
                required
                rows={2}
                value={notifMessage}
                onChange={e => setNotifMessage(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-white focus:border-[#268FFF] outline-none text-xs sm:text-sm resize-none"
              ></textarea>
            </div>
            <button 
              type="submit"
              disabled={sendingNotif}
              className="w-full bg-[#268FFF] hover:bg-[#1f7fe6] text-white font-semibold text-xs sm:text-sm p-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
              {sendingNotif ? t('admin_notif_sending') : t('admin_notif_send')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
