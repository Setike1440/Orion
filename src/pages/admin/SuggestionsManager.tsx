import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { MessageSquarePlus, Check, Trash2, Clock, User, Mail, Gamepad2, Sparkles, Filter, Code2, Copy, CheckCircle2, RefreshCw } from 'lucide-react';
import { AdminToast } from '../../components/admin/AdminModal';

interface Suggestion {
  id: string;
  user_id?: string | null;
  user_name?: string;
  user_email?: string;
  game_title: string;
  category?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'dismissed' | string;
  created_at: string;
}

export const SuggestionsManager = () => {
  usePageTitle('Sugestões dos Clientes | Painel Admin');
  const { t } = useLanguage();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const sqlCode = `-- Tabela para Sugestões de Jogos dos Clientes
CREATE TABLE IF NOT EXISTS public.game_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  game_title TEXT NOT NULL,
  category TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS e Permissões de Acesso
ALTER TABLE public.game_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir inserção pública" ON public.game_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura geral" ON public.game_suggestions FOR SELECT USING (true);
CREATE POLICY "Permitir atualização e exclusão" ON public.game_suggestions FOR ALL USING (true);`;

  useEffect(() => {
    fetchSuggestions();

    // Setup real-time subscription on Supabase table
    const channel = supabase
      .channel('game_suggestions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_suggestions' },
        (payload) => {
          fetchSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    let remoteData: Suggestion[] = [];

    // Try fetching from Supabase
    try {
      const { data, error } = await supabase
        .from('game_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        remoteData = data;
      }
    } catch (err) {
      console.log('Note: game_suggestions table sync fallback active');
    }

    // Merge with local fallback storage
    let localData: Suggestion[] = [];
    try {
      localData = JSON.parse(localStorage.getItem('game_suggestions_local') || '[]');
    } catch (err) {
      localData = [];
    }

    // Combine and deduplicate by id
    const map = new Map<string, Suggestion>();
    [...remoteData, ...localData].forEach(item => {
      if (item && item.id) {
        map.set(item.id, item);
      }
    });

    const combined = Array.from(map.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setSuggestions(combined);
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    // Update local state instantly
    setSuggestions(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));

    // Update localStorage
    try {
      const local: Suggestion[] = JSON.parse(localStorage.getItem('game_suggestions_local') || '[]');
      const updatedLocal = local.map(item => item.id === id ? { ...item, status: nextStatus } : item);
      localStorage.setItem('game_suggestions_local', JSON.stringify(updatedLocal));
    } catch (e) {}

    // Update Supabase
    try {
      await supabase.from('game_suggestions').update({ status: nextStatus }).eq('id', id);
    } catch (e) {}

    setToastType('success');
    setToastMessage(`Status alterado para: ${nextStatus === 'completed' ? 'Concluído' : 'Pendente'}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sugestão?')) return;

    // Update local state instantly
    setSuggestions(prev => prev.filter(item => item.id !== id));

    // Update localStorage
    try {
      const local: Suggestion[] = JSON.parse(localStorage.getItem('game_suggestions_local') || '[]');
      const updatedLocal = local.filter(item => item.id !== id);
      localStorage.setItem('game_suggestions_local', JSON.stringify(updatedLocal));
    } catch (e) {}

    // Update Supabase
    try {
      await supabase.from('game_suggestions').delete().eq('id', id);
    } catch (e) {}

    setToastType('success');
    setToastMessage('Sugestão excluída com sucesso.');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const filteredSuggestions = suggestions.filter(item => {
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'completed') return item.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <AdminToast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquarePlus className="w-6 h-6 text-[#FF0000]" />
            Sugestões dos Clientes
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Acompanhe em tempo real os jogos solicitados pelos usuários do site
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSuggestions}
            className="bg-[#0d0e12] border border-[#20222c] hover:bg-[#1a1c26] hover:border-[#3a3d52] text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSqlModal(!showSqlModal)}
            className="bg-[#0d0e12] border border-[#20222c] hover:bg-[#1a1c26] hover:border-[#3a3d52] text-[#FF0000] hover:text-red-400 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Script SQL</span>
          </button>
        </div>
      </div>

      {/* SQL Script Accordion / Box */}
      {showSqlModal && (
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-5 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#1f212a] pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#FF0000]" />
              <h3 className="text-sm font-bold text-white">Código SQL para Supabase (Ao Vivo)</h3>
            </div>
            <button
              onClick={handleCopySql}
              className="bg-[#181920] hover:bg-[#20222c] border border-[#20222c] text-xs font-semibold text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Cole este comando no Editor SQL do seu projeto no Supabase para criar a tabela de sugestões com sincronização e tempo real habilitados:
          </p>
          <pre className="bg-[#000000] border border-[#1f212a] p-3.5 rounded-xl text-[11px] font-mono text-gray-300 overflow-x-auto leading-relaxed">
            {sqlCode}
          </pre>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-3 flex items-center justify-between flex-wrap gap-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-500 ml-2 mr-1" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filter === 'all' ? 'bg-[#FF0000] text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-[#181920]'
            }`}
          >
            Todas ({suggestions.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filter === 'pending' ? 'bg-[#FF0000] text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-[#181920]'
            }`}
          >
            Pendentes ({suggestions.filter(s => s.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filter === 'completed' ? 'bg-[#FF0000] text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-[#181920]'
            }`}
          >
            Concluídas ({suggestions.filter(s => s.status === 'completed').length})
          </button>
        </div>

        <span className="text-xs text-gray-500 mr-2">
          {filteredSuggestions.length} {filteredSuggestions.length === 1 ? 'sugestão' : 'sugestões'}
        </span>
      </div>

      {/* List / Cards */}
      {filteredSuggestions.length === 0 ? (
        <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-12 text-center shadow-sm">
          <MessageSquarePlus className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhuma sugestão encontrada</h3>
          <p className="text-xs text-gray-400">
            Quando os clientes pedirem jogos pelo botão "Pedir Jogo" no cabeçalho, as sugestões aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuggestions.map((item) => {
            const isCompleted = item.status === 'completed';
            const dateFormatted = item.created_at ? new Date(item.created_at).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Recentemente';

            return (
              <div
                key={item.id}
                className={`bg-[#0d0e12] border ${
                  isCompleted ? 'border-emerald-500/30' : 'border-[#1f212a]'
                } rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between relative group`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#181920] border border-[#20222c] rounded-full text-[10px] text-gray-300 font-semibold mb-2">
                        <Sparkles className="w-3 h-3 text-[#FF0000]" />
                        <span>{item.category || 'Steam'}</span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-[#FF0000] shrink-0" />
                        <span>{item.game_title}</span>
                      </h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isCompleted ? 'Adicionado / Concluído' : 'Pendente'}
                    </span>
                  </div>

                  {/* Notes if present */}
                  {item.notes && (
                    <div className="bg-[#000000] border border-[#1f212a] p-3 rounded-xl text-xs text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">
                      <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-1">Observações do cliente:</span>
                      {item.notes}
                    </div>
                  )}

                  {/* Sender Details */}
                  <div className="bg-[#14151c] border border-[#1f212a] p-3 rounded-xl space-y-1.5 text-xs text-gray-400">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                        <User className="w-3.5 h-3.5 text-[#FF0000]" />
                        {item.user_name || 'Anônimo'}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Clock className="w-3 h-3" />
                        {dateFormatted}
                      </span>
                    </div>

                    {item.user_email && item.user_email !== 'Não informado' && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1 border-t border-[#1f212a]/80">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span>{item.user_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-[#1f212a] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Marcar como Pendente' : 'Marcar como Concluído'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                    title="Excluir sugestão"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
