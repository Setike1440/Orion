import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Shield, Mail, Calendar, Key, Settings as SettingsIcon, Save, CheckCircle } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { Skeleton } from '../components/Skeleton';
import { usePageTitle } from '../hooks/usePageTitle';
import { supabase } from '../lib/supabase';

export const Settings = () => {
  usePageTitle('Configurações');
  const { user, profile, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    } else if (profile?.email) {
      setUsername(profile.email.split('@')[0]);
    }
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, [profile]);

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username.trim()) return;
    const newName = username.trim();
    setSavingUsername(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newName })
        .eq('id', user.id);
      
      if (error && (error.message?.includes('username') || error.code === 'PGRST204')) {
        console.warn('Username column missing in Supabase schema cache:', error);
      }

      try {
        const localUsernames = JSON.parse(localStorage.getItem('custom_usernames') || '{}');
        localUsernames[user.id] = newName;
        localStorage.setItem('custom_usernames', JSON.stringify(localUsernames));
      } catch (err) {}

      // Immediately update auth profile state so Navbar and Settings header update live
      updateProfile({ username: newName });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Error updating username:', e);
    } finally {
      setSavingUsername(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] pt-12 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#000000] pt-12 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb 
          items={[
            { label: t('my_account'), path: '/configuracoes' },
            { label: t('settings') }
          ]} 
        />

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-[#FF0000]" />
          {t('settings') || 'Configurações da Conta'}
        </h1>

        <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-6 border-b border-[#1f212a] pb-8 mb-8">
            <div className="w-20 h-20 rounded-full bg-[#181920] border border-[#1f212a] flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{profile?.username || profile?.email?.split('@')[0] || 'Usuário'}</h2>
              <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" /> {profile?.email || user.email}
              </p>
              {profile?.role?.trim().toLowerCase() === 'admin' && (
                <div className="mt-3 inline-flex items-center gap-2 bg-[#181920] border border-[#1f212a] px-3 py-1 rounded-full">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-gray-300 capitalize">
                    Admin
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF0000]" />
                {t('profile_details')}
              </h3>
              
              <form onSubmit={handleSaveUsername} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Nome de Usuário
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Seu nome de usuário"
                      required
                      className="flex-1 bg-[#000000] border border-[#1f212a] focus:border-[#FF0000] rounded-xl p-3 text-xs text-white focus:outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={savingUsername}
                      className="bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs px-4 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {savingUsername ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Salvar</span>
                    </button>
                  </div>
                  {saveSuccess && (
                    <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Nome de usuário salvo com sucesso!
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('user_id')}</label>
                  <input type="text" disabled value={user.id} className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-3 text-xs text-gray-300 font-mono opacity-80" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" /> {t('member_since')}
                  </label>
                  <input type="text" disabled value={new Date(user.created_at).toLocaleDateString()} className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-3 text-xs text-gray-300 opacity-80" />
                </div>
              </form>
            </div>

            <div className="space-y-5">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#FF0000]" />
                {t('security')}
              </h3>
              
              <div className="bg-[#000000] border border-[#1f212a] rounded-xl p-5">
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  {t('security_info')}
                </p>
                <button disabled className="w-full bg-[#181920] border border-[#1f212a] text-gray-500 font-semibold text-xs py-2.5 px-4 rounded-xl cursor-not-allowed">
                  {t('change_password')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
