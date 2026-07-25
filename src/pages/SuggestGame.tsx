import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { Breadcrumb } from '../components/Breadcrumb';
import { MessageSquarePlus, Send, CheckCircle2, ArrowLeft, Gamepad2, Sparkles, User, Mail, LogIn } from 'lucide-react';

export const SuggestGame = () => {
  usePageTitle('Pedir / Sugerir Jogo');
  const { user, profile, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [gameTitle, setGameTitle] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [senderName, setSenderName] = useState(profile?.username || user?.email?.split('@')[0] || '');
  const [senderEmail, setSenderEmail] = useState(profile?.email || user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTitle.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    const suggestionObj = {
      id: crypto.randomUUID(),
      user_id: user?.id || null,
      user_name: senderName.trim() || 'Visitante',
      user_email: senderEmail.trim() || 'Não informado',
      game_title: gameTitle.trim(),
      category: category.trim() || 'Steam',
      notes: notes.trim(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // 1. Save to LocalStorage for offline/instant fallback sync
    try {
      const existing = JSON.parse(localStorage.getItem('game_suggestions_local') || '[]');
      localStorage.setItem('game_suggestions_local', JSON.stringify([suggestionObj, ...existing]));
    } catch (err) {
      console.error('Error saving local suggestion fallback', err);
    }

    // 2. Try inserting into Supabase
    try {
      await supabase.from('game_suggestions').insert([{
        user_id: suggestionObj.user_id,
        user_name: suggestionObj.user_name,
        user_email: suggestionObj.user_email,
        game_title: suggestionObj.game_title,
        category: suggestionObj.category,
        notes: suggestionObj.notes,
        status: 'pending',
        created_at: suggestionObj.created_at
      }]);
    } catch (err: any) {
      console.log('Supabase insert note (fallback stored in local):', err?.message);
    }

    setLoading(false);
    setSuccess(true);
    setGameTitle('');
    setCategory('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-[#000000] py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumb 
          items={[
            { label: t('all_games'), path: '/' },
            { label: t('suggest_game') }
          ]} 
        />

        <div className="mt-6 bg-[#0d0e12] border border-[#1f212a] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF0000]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/30 flex items-center justify-center text-[#FF0000] shrink-0">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t('suggest_game_title')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {t('suggest_game_desc')}
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#252733] to-transparent my-6" />

          {!user ? (
            <div className="bg-[#12141d] border border-[#FF0000]/30 rounded-2xl p-8 sm:p-10 text-center space-y-4 my-4">
              <div className="w-16 h-16 bg-[#FF0000]/10 border border-[#FF0000]/30 rounded-2xl flex items-center justify-center mx-auto text-[#FF0000]">
                <LogIn className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Login Necessário</h3>
              <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                Somente usuários cadastrados e logados podem enviar sugestões ou pedir novos jogos para a nossa equipe.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar na Conta / Cadastrar-se
                </button>
              </div>
            </div>
          ) : success ? (
            <div className="bg-[#12141d] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-4 my-4">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Obrigado pela sugestão!</h3>
              <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                {t('suggestion_success_msg')}
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="bg-[#181920] hover:bg-[#20222c] border border-[#20222c] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Sugerir outro jogo
                </button>
                <Link
                  to="/"
                  className="bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Catálogo
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Sender info preview / editable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FF0000]" /> Seu Nome / Nick *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Ex: Gabriel"
                    className="w-full bg-[#000000] border border-[#1f212a] rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]/20 transition-all placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#FF0000]" /> Seu E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full bg-[#000000] border border-[#1f212a] rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]/20 transition-all placeholder-gray-600"
                  />
                </div>
              </div>

              {/* Game Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-[#FF0000]" /> {t('game_title_label')} *
                </label>
                <input
                  type="text"
                  required
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="Ex: Elden Ring: Shadow of the Erdtree"
                  className="w-full bg-[#000000] border border-[#1f212a] rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]/20 transition-all placeholder-gray-600"
                />
              </div>

              {/* Category / Platform */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF0000]" /> {t('category_platform_label')} *
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Steam, RPG, Mundo Aberto"
                  className="w-full bg-[#000000] border border-[#1f212a] rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]/20 transition-all placeholder-gray-600"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  {t('notes_label')}
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma informação extra sobre o jogo ou versão desejada..."
                  className="w-full bg-[#000000] border border-[#1f212a] rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]/20 transition-all placeholder-gray-600 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !senderName.trim() || !senderEmail.trim() || !gameTitle.trim() || !category.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF0000]"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Enviando...' : t('send_suggestion_btn')}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
