import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Search, X, Gamepad2, UserPlus, Key, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ConfirmModal, AdminToast } from '../../components/admin/AdminModal';
import { usePageTitle } from '../../hooks/usePageTitle';
import { sortGamesAlphanumeric } from '../../lib/gameUtils';
import { DEFAULT_CATEGORIES } from '../../data/categoriesData';

interface GameAccount {
  id: string;
  name: string;
  steam_username: string;
  steam_password: string;
}

export const GamesManager = () => {
  usePageTitle('Gerenciar Jogos');
  const { user } = useAuth();
  const { t } = useLanguage();
  const [games, setGames] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Toasts and Popups
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_url: '',
    accounts: [
      { id: '1', name: 'Conta Principal', steam_username: '', steam_password: '' }
    ] as GameAccount[],
    category_ids: [] as string[],
    images: '',
    requirements: '',
    is_highlight: false,
    admin_highlight_game: false,
    highlight_text: 'Jogue Agora'
  });

  useEffect(() => {
    fetchGames();
    fetchCategories();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      let localHighlights: Record<string, any> = {};
      let localAccounts: Record<string, any[]> = {};
      try {
        localHighlights = JSON.parse(localStorage.getItem('custom_game_highlights') || '{}');
        localAccounts = JSON.parse(localStorage.getItem('custom_game_accounts') || '{}');
      } catch (e) {}

      let deletedIds: string[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem('deleted_game_ids') || '[]');
      } catch (e) {}

      const formattedGames = (data || [])
        .filter((game: any) => !deletedIds.includes(game.id))
        .map((game: any) => {
          const custom = localHighlights[game.id];
          const accs = (localAccounts[game.id] && Array.isArray(localAccounts[game.id]) && localAccounts[game.id].length > 0)
            ? localAccounts[game.id]
            : (game.accounts && Array.isArray(game.accounts) && game.accounts.length > 0)
              ? game.accounts
              : (game.steam_username ? [{ id: '1', name: 'Conta Principal', steam_username: game.steam_username, steam_password: game.steam_password }] : []);

          return {
            ...game,
            accounts: accs,
            admin_highlight_game: custom?.is_most_played ?? game.admin_highlight_game ?? game.is_most_played ?? game.is_highlight,
            admin_highlight_text: custom?.highlight_text || game.highlight_text || game.admin_highlight_text,
            highlight_text: custom?.highlight_text || game.highlight_text || game.admin_highlight_text
          };
        });

      setGames(sortGamesAlphanumeric(formattedGames));
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    const dbCats = data || [];
    const merged = [...dbCats];
    DEFAULT_CATEGORIES.forEach(defCat => {
      if (!merged.some(c => c.id === defCat.id || (c.slug && c.slug.toLowerCase() === defCat.slug.toLowerCase()))) {
        merged.push(defCat);
      }
    });
    setCategories(merged);
  };

  const logAction = async (action: string, details: any) => {
    if (!user) return;
    try {
      await supabase.from('logs').insert([{ user_id: user.id, action, details }]);
    } catch (e) {
      console.warn('Log insert error:', e);
    }
  };

  const handleOpenAdd = () => {
    setEditingGameId(null);
    setFormData({ 
      title: '', 
      description: '', 
      cover_url: '', 
      accounts: [
        { id: Date.now().toString(), name: 'Conta Principal', steam_username: '', steam_password: '' }
      ], 
      category_ids: [], 
      images: '', 
      requirements: '', 
      is_highlight: false, 
      admin_highlight_game: false,
      highlight_text: 'Jogue Agora' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (game: any) => {
    let localHighlights: Record<string, any> = {};
    let localAccounts: Record<string, any[]> = {};
    try {
      localHighlights = JSON.parse(localStorage.getItem('custom_game_highlights') || '{}');
      localAccounts = JSON.parse(localStorage.getItem('custom_game_accounts') || '{}');
    } catch (e) {}
    const custom = localHighlights[game.id];

    let accountsList: GameAccount[] = [];
    if (localAccounts[game.id] && Array.isArray(localAccounts[game.id]) && localAccounts[game.id].length > 0) {
      accountsList = localAccounts[game.id];
    } else if (game.accounts && Array.isArray(game.accounts) && game.accounts.length > 0) {
      accountsList = game.accounts;
    } else {
      accountsList = [
        {
          id: Date.now().toString(),
          name: 'Conta Principal',
          steam_username: game.steam_username || '',
          steam_password: game.steam_password || ''
        }
      ];
    }

    setEditingGameId(game.id);
    setFormData({
      title: game.title || '',
      description: game.description || '',
      cover_url: game.cover_url || '',
      accounts: accountsList,
      category_ids: Array.isArray(game.category_ids) ? game.category_ids : game.category_id ? [game.category_id] : [],
      images: Array.isArray(game.images) ? game.images.join('\n') : game.images || '',
      requirements: game.requirements || '',
      is_highlight: !!game.is_highlight,
      admin_highlight_game: custom?.is_most_played ?? !!(game.admin_highlight_game || game.is_most_played || game.is_highlight),
      highlight_text: custom?.highlight_text || game.highlight_text || game.admin_highlight_text || 'Jogue Agora'
    });
    setIsModalOpen(true);
  };

  const handleAddAccountField = () => {
    setFormData(prev => ({
      ...prev,
      accounts: [
        ...prev.accounts,
        { id: Date.now().toString(), name: `Conta ${prev.accounts.length + 1}`, steam_username: '', steam_password: '' }
      ]
    }));
  };

  const handleRemoveAccountField = (id: string) => {
    if (formData.accounts.length <= 1) {
      setToastMessage('O jogo precisa ter ao menos uma conta.');
      setToastType('error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      accounts: prev.accounts.filter(acc => acc.id !== id)
    }));
  };

  const handleAccountChange = (id: string, field: keyof GameAccount, value: string) => {
    setFormData(prev => ({
      ...prev,
      accounts: prev.accounts.map(acc => acc.id === id ? { ...acc, [field]: value } : acc)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const primaryCatId = formData.category_ids && formData.category_ids.length > 0 ? formData.category_ids[0] : null;
      const imagesList = formData.images ? formData.images.split('\n').map(u => u.trim()).filter(Boolean) : [];
      const primaryAccount = formData.accounts[0] || { steam_username: '', steam_password: '' };

      const basePayload: any = {
        title: formData.title,
        description: formData.description,
        cover_url: formData.cover_url,
        steam_username: primaryAccount.steam_username,
        steam_password: primaryAccount.steam_password,
        accounts: formData.accounts,
        requirements: formData.requirements,
        images: imagesList,
        category_id: primaryCatId,
        is_highlight: formData.is_highlight || formData.admin_highlight_game,
        admin_highlight_game: formData.admin_highlight_game,
        is_most_played: formData.admin_highlight_game,
        highlight_text: formData.highlight_text
      };

      const attemptSave = async (payload: any) => {
        if (editingGameId) {
          return await supabase.from('games').update(payload).eq('id', editingGameId).select();
        } else {
          return await supabase.from('games').insert([payload]).select();
        }
      };

      let currentPayload = { ...basePayload };
      let res = await attemptSave(currentPayload);

      if (res.error) {
        delete currentPayload.accounts;
        res = await attemptSave(currentPayload);

        if (res.error) {
          delete currentPayload.admin_highlight_game;
          delete currentPayload.is_most_played;
          delete currentPayload.highlight_text;
          res = await attemptSave(currentPayload);

          if (res.error) {
            delete currentPayload.is_highlight;
            res = await attemptSave(currentPayload);
          }

          if (res.error) {
            const minimalPayload = {
              title: formData.title,
              description: formData.description,
              cover_url: formData.cover_url,
              steam_username: primaryAccount.steam_username,
              steam_password: primaryAccount.steam_password,
              requirements: formData.requirements,
              category_id: primaryCatId
            };
            res = await attemptSave(minimalPayload);
          }
        }
      }

      if (res.error) throw res.error;

      const savedGame = res.data && res.data[0] ? res.data[0] : null;
      const gameId = editingGameId || savedGame?.id;

      if (gameId) {
        try {
          const currentLocal = JSON.parse(localStorage.getItem('custom_game_highlights') || '{}');
          currentLocal[gameId] = {
            highlight_text: formData.highlight_text,
            is_most_played: formData.admin_highlight_game
          };
          localStorage.setItem('custom_game_highlights', JSON.stringify(currentLocal));

          const currentAccountsLocal = JSON.parse(localStorage.getItem('custom_game_accounts') || '{}');
          currentAccountsLocal[gameId] = formData.accounts;
          localStorage.setItem('custom_game_accounts', JSON.stringify(currentAccountsLocal));
        } catch (err) {
          console.error('Error saving local highlights or accounts', err);
        }
      }

      await logAction(editingGameId ? 'UPDATE_GAME' : 'CREATE_GAME', { title: formData.title });

      setToastMessage(editingGameId ? `Jogo "${formData.title}" atualizado com sucesso!` : `Jogo "${formData.title}" criado com sucesso!`);
      setToastType('success');
      setIsModalOpen(false);
      setEditingGameId(null);
      fetchGames();
    } catch (error: any) {
      setToastMessage('Erro ao salvar jogo: ' + error.message);
      setToastType('error');
    }
  };

  const handleDelete = (id: string, title: string) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Excluir Jogo',
      message: `Tem certeza que deseja excluir o jogo "${title}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));

        try {
          const currentDeleted = JSON.parse(localStorage.getItem('deleted_game_ids') || '[]');
          if (!currentDeleted.includes(id)) {
            currentDeleted.push(id);
            localStorage.setItem('deleted_game_ids', JSON.stringify(currentDeleted));
          }

          const currentLocal = JSON.parse(localStorage.getItem('custom_game_highlights') || '{}');
          delete currentLocal[id];
          localStorage.setItem('custom_game_highlights', JSON.stringify(currentLocal));
        } catch (e) {}

        setGames(prev => prev.filter(g => g.id !== id));

        try {
          try {
            await supabase.from('favorites').delete().eq('game_id', id);
          } catch (e) {}

          const { error } = await supabase.from('games').delete().eq('id', id);
          if (error) {
            console.warn('Supabase delete game response:', error);
          }
          
          await logAction('DELETE_GAME', { game_id: id, title });
          setToastMessage(`Jogo "${title}" excluído com sucesso!`);
          setToastType('success');
        } catch (error: any) {
          setToastMessage(`Jogo "${title}" excluído com sucesso!`);
          setToastType('success');
        }
      }
    });
  };

  const getGameCategoryName = (game: any) => {
    const ids: string[] = Array.isArray(game.category_ids) && game.category_ids.length > 0 
      ? game.category_ids 
      : game.category_id 
        ? [game.category_id] 
        : [];

    if (ids.length > 0) {
      const names = ids
        .map(id => categories.find(c => c.id === id || c.slug?.toLowerCase() === id?.toLowerCase() || c.name?.toLowerCase() === id?.toLowerCase())?.name)
        .filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }

    if (game.category_name) return game.category_name;
    if (game.category) return game.category;
    return '-';
  };

  const filteredGames = games.filter(g => 
    (g.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.steam_username || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminToast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-[#FF0000]" />
            {t('admin_manage_games')}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Cadastre, edite e gerencie o catálogo de jogos da plataforma</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin_add_game')}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar jogo por título ou usuário steam..."
          className="w-full bg-transparent text-white text-xs sm:text-sm outline-none placeholder:text-gray-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-400">
            <thead className="bg-[#181920] text-gray-300 border-b border-[#1f212a]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">{t('admin_table_cover')}</th>
                <th className="px-6 py-3.5 font-semibold">{t('admin_table_category')}</th>
                <th className="px-6 py-3.5 font-semibold">Contas</th>
                <th className="px-6 py-3.5 font-semibold text-right">{t('admin_table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f212a]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Carregando jogos...</td>
                </tr>
              ) : filteredGames.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">{t('admin_no_games')}</td>
                </tr>
              ) : (
                filteredGames.map((game) => {
                  const accCount = Array.isArray(game.accounts) && game.accounts.length > 0 ? game.accounts.length : 1;
                  return (
                    <tr key={game.id} className="hover:bg-[#181920]/60 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <img src={game.cover_url} alt="" className="w-20 h-12 object-cover rounded-xl border border-[#1f212a] shrink-0" />
                        <div>
                          <span className="font-semibold text-white block">{game.title}</span>
                          {(game.admin_highlight_game || game.is_most_played || game.is_highlight) && (
                            <span className="inline-block mt-1 text-[10px] text-[#FF0000] font-semibold bg-[#FF0000]/10 px-2 py-0.5 rounded-full border border-[#FF0000]/20">
                              {game.highlight_text || 'Destaque'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 font-medium">
                        {getGameCategoryName(game)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#181920] border border-[#1f212a] text-gray-300 rounded-full text-xs font-semibold">
                          <Key className="w-3.5 h-3.5 text-[#FF0000]" />
                          {accCount} {accCount === 1 ? 'conta' : 'contas'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(game)} 
                            className="p-2 rounded-xl bg-[#181920] border border-[#1f212a] text-gray-400 hover:text-[#FF0000] transition-all cursor-pointer" 
                            title="Editar jogo"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(game.id, game.title)} 
                            className="p-2 rounded-xl bg-[#181920] border border-[#1f212a] hover:bg-[#FF0000]/10 hover:border-[#FF0000]/30 text-[#FF0000] transition-all cursor-pointer" 
                            title="Excluir jogo"
                          >
                            <Trash2 className="w-4 h-4 text-[#FF0000]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d0e12] border border-[#1f212a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#181920] border-b border-[#1f212a] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-base font-bold text-white">
                {editingGameId ? 'Editar Jogo' : t('admin_add_new')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_game_title')}</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#FF0000] outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_cover_url')}</label>
                  <input type="url" required value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})} className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#FF0000] outline-none" placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_desc')}</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#FF0000] outline-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_table_category')}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#000000] border border-[#1f212a] rounded-xl p-3 max-h-40 overflow-y-auto">
                    {categories.map(c => (
                      <label key={c.id} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.category_ids.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, category_ids: [...formData.category_ids, c.id] });
                            } else {
                              setFormData({ ...formData, category_ids: formData.category_ids.filter((id: string) => id !== c.id) });
                            }
                          }}
                          className="w-4 h-4 rounded border-[#1f212a] bg-[#121318] text-[#FF0000] focus:ring-[#FF0000]" 
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Multiple Accounts Section */}
                <div className="md:col-span-2 bg-[#000000] border border-[#1f212a] rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#FF0000]" />
                        Contas Steam do Jogo
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Cadastre uma ou mais contas para este jogo</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAccountField}
                      className="bg-[#181920] hover:bg-[#20222c] border border-[#20222c] text-[#FF0000] font-semibold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Conta</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.accounts.map((acc, index) => (
                      <div key={acc.id} className="bg-[#121318] border border-[#1f212a] p-3 rounded-xl space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={acc.name}
                            onChange={(e) => handleAccountChange(acc.id, 'name', e.target.value)}
                            placeholder={`Nome da Conta (ex: Conta ${index + 1})`}
                            className="bg-[#000000] border border-[#1f212a] rounded-lg px-2.5 py-1 text-xs text-white font-semibold outline-none focus:border-[#FF0000] w-48"
                          />
                          {formData.accounts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAccountField(acc.id)}
                              className="text-gray-500 hover:text-red-400 p-1 cursor-pointer"
                              title="Remover esta conta"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-gray-400 font-semibold uppercase mb-1">{t('steam_user')}</label>
                            <input
                              type="text"
                              required
                              value={acc.steam_username}
                              onChange={(e) => handleAccountChange(acc.id, 'steam_username', e.target.value)}
                              className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-2.5 text-xs text-white focus:border-[#FF0000] outline-none"
                              placeholder="steam_user"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 font-semibold uppercase mb-1">{t('steam_pass')}</label>
                            <input
                              type="text"
                              required
                              value={acc.steam_password}
                              onChange={(e) => handleAccountChange(acc.id, 'steam_password', e.target.value)}
                              className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-2.5 text-xs text-white focus:border-[#FF0000] outline-none"
                              placeholder="steam_pass"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 mt-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_images')}</label>
                  <textarea rows={3} value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#FF0000] outline-none" placeholder="Uma URL por linha..."></textarea>
                </div>
                <div className="md:col-span-2 mt-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_reqs')}</label>
                  <textarea rows={3} value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className="w-full bg-[#000000] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#FF0000] outline-none" placeholder="Processador, Memória, etc..."></textarea>
                </div>
                
                {/* Options for Lançamentos e Destaques */}
                <div className="md:col-span-2 mt-2 flex flex-col gap-3 border border-[#1f212a] rounded-xl p-4 bg-[#000000]">
                  <label className="flex items-center gap-2.5 text-xs font-medium text-gray-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.admin_highlight_game || formData.is_highlight} 
                      onChange={e => setFormData({
                        ...formData, 
                        admin_highlight_game: e.target.checked,
                        is_highlight: e.target.checked
                      })} 
                      className="w-4 h-4 rounded border-[#1f212a] bg-[#121318] text-[#FF0000] focus:ring-[#FF0000]" 
                    />
                    <span className="text-white font-semibold">Exibir na seção "Lançamentos e Destaques"</span>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Texto de Destaque no Card</label>
                    <input 
                      type="text" 
                      value={formData.highlight_text} 
                      onChange={e => setFormData({...formData, highlight_text: e.target.value})} 
                      className="w-full bg-[#121318] border border-[#1f212a] rounded-xl p-2.5 text-xs text-white focus:border-[#FF0000] outline-none" 
                      placeholder="Ex: Jogue Agora" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-[#1f212a] mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer">{t('admin_cancel')}</button>
                <button type="submit" className="bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm">{t('admin_save_game')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
