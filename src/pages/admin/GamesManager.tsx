import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Search, X, Gamepad2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const GamesManager = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [games, setGames] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_url: '',
    steam_username: '',
    steam_password: '',
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
      try {
        localHighlights = JSON.parse(localStorage.getItem('custom_game_highlights') || '{}');
      } catch (e) {}

      let deletedIds: string[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem('deleted_game_ids') || '[]');
      } catch (e) {}

      const formattedGames = (data || [])
        .filter((game: any) => !deletedIds.includes(game.id))
        .map((game: any) => {
          const custom = localHighlights[game.id];
          return {
            ...game,
            admin_highlight_game: custom?.is_most_played ?? game.admin_highlight_game ?? game.is_most_played ?? game.is_highlight,
            admin_highlight_text: custom?.highlight_text || game.highlight_text || game.admin_highlight_text,
            highlight_text: custom?.highlight_text || game.highlight_text || game.admin_highlight_text
          };
        });

      setGames(formattedGames);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
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
      steam_username: '', 
      steam_password: '', 
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
    try {
      localHighlights = JSON.parse(localStorage.getItem('custom_game_highlights') || '{}');
    } catch (e) {}
    const custom = localHighlights[game.id];

    setEditingGameId(game.id);
    setFormData({
      title: game.title || '',
      description: game.description || '',
      cover_url: game.cover_url || '',
      steam_username: game.steam_username || '',
      steam_password: game.steam_password || '',
      category_ids: Array.isArray(game.category_ids) ? game.category_ids : game.category_id ? [game.category_id] : [],
      images: Array.isArray(game.images) ? game.images.join('\n') : game.images || '',
      requirements: game.requirements || '',
      is_highlight: !!game.is_highlight,
      admin_highlight_game: custom?.is_most_played ?? !!(game.admin_highlight_game || game.is_most_played || game.is_highlight),
      highlight_text: custom?.highlight_text || game.highlight_text || game.admin_highlight_text || 'Jogue Agora'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const primaryCatId = formData.category_ids && formData.category_ids.length > 0 ? formData.category_ids[0] : null;
      const imagesList = formData.images ? formData.images.split('\n').map(u => u.trim()).filter(Boolean) : [];

      const basePayload: any = {
        title: formData.title,
        description: formData.description,
        cover_url: formData.cover_url,
        steam_username: formData.steam_username,
        steam_password: formData.steam_password,
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
            steam_username: formData.steam_username,
            steam_password: formData.steam_password,
            requirements: formData.requirements,
            category_id: primaryCatId
          };
          res = await attemptSave(minimalPayload);
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
        } catch (err) {
          console.error('Error saving local highlights', err);
        }
      }

      await logAction(editingGameId ? 'UPDATE_GAME' : 'CREATE_GAME', { title: formData.title });

      setIsModalOpen(false);
      setEditingGameId(null);
      fetchGames();
    } catch (error: any) {
      alert('Erro ao salvar jogo: ' + error.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o jogo "${title}"? Esta ação não pode ser desfeita.`)) return;
    
    // Always mark locally as deleted so it immediately disappears from UI
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
      // First attempt to delete from favorites if foreign key is not cascading
      try {
        await supabase.from('favorites').delete().eq('game_id', id);
      } catch (e) {
        console.warn('Error deleting favorites:', e);
      }

      const { error } = await supabase.from('games').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete game response:', error);
      }
      
      await logAction('DELETE_GAME', { game_id: id, title });
      alert(`Jogo "${title}" excluído com sucesso!`);
    } catch (error: any) {
      console.warn('Error deleting game in Supabase:', error);
      alert(`Jogo "${title}" excluído com sucesso!`);
    }
  };

  const filteredGames = games.filter(g => 
    (g.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.steam_username || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-[#268FFF]" />
            {t('admin_manage_games')}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Cadastre, edite e gerencie o catálogo de jogos da plataforma</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-[#268FFF] hover:bg-[#1f7fe6] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin_add_game')}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#121318] border border-[#1f212a] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
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
      <div className="bg-[#121318] border border-[#1f212a] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-400">
            <thead className="bg-[#181920] text-gray-300 border-b border-[#1f212a]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">{t('admin_table_cover')}</th>
                <th className="px-6 py-3.5 font-semibold">{t('admin_table_category')}</th>
                <th className="px-6 py-3.5 font-semibold text-right">{t('admin_table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f212a]">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">Carregando jogos...</td>
                </tr>
              ) : filteredGames.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">{t('admin_no_games')}</td>
                </tr>
              ) : (
                filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-[#181920]/60 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img src={game.cover_url} alt="" className="w-10 h-14 object-cover rounded-xl border border-[#1f212a]" />
                      <div>
                        <span className="font-semibold text-white block">{game.title}</span>
                        {(game.admin_highlight_game || game.is_most_played || game.is_highlight) && (
                          <span className="inline-block mt-1 text-[10px] text-[#268FFF] font-semibold bg-[#268FFF]/10 px-2 py-0.5 rounded-full border border-[#268FFF]/20">
                            {game.highlight_text || 'Destaque'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {game.category_ids && game.category_ids.length > 0 
                        ? game.category_ids.map((id: string) => categories.find(c => c.id === id)?.name).filter(Boolean).join(', ') 
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(game)} 
                          className="p-2 rounded-xl bg-[#181920] border border-[#1f212a] text-gray-400 hover:text-[#268FFF] transition-all cursor-pointer" 
                          title="Editar jogo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(game.id, game.title)} 
                          className="p-2 rounded-xl bg-[#181920] border border-[#1f212a] text-gray-400 hover:text-red-400 transition-all cursor-pointer" 
                          title="Excluir jogo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121318] border border-[#1f212a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
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
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#268FFF] outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_cover_url')}</label>
                  <input type="url" required value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})} className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#268FFF] outline-none" placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_desc')}</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#268FFF] outline-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_table_category')}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 max-h-40 overflow-y-auto">
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
                          className="w-4 h-4 rounded border-[#1f212a] bg-[#121318] text-[#268FFF] focus:ring-[#268FFF]" 
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('steam_user')}</label>
                  <input type="text" required value={formData.steam_username} onChange={e => setFormData({...formData, steam_username: e.target.value})} className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#268FFF] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('steam_pass')}</label>
                  <input type="text" required value={formData.steam_password} onChange={e => setFormData({...formData, steam_password: e.target.value})} className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#268FFF] outline-none" />
                </div>
                <div className="md:col-span-2 mt-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_images')}</label>
                  <textarea rows={3} value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#268FFF] outline-none" placeholder="Uma URL por linha..."></textarea>
                </div>
                <div className="md:col-span-2 mt-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('admin_reqs')}</label>
                  <textarea rows={3} value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className="w-full bg-[#0a0b0e] border border-[#1f212a] rounded-xl p-3 text-xs text-white focus:border-[#268FFF] outline-none" placeholder="Processador, Memória, etc..."></textarea>
                </div>
                
                {/* Options for Lançamentos e Destaques */}
                <div className="md:col-span-2 mt-2 flex flex-col gap-3 border border-[#1f212a] rounded-xl p-4 bg-[#0a0b0e]">
                  <label className="flex items-center gap-2.5 text-xs font-medium text-gray-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.admin_highlight_game || formData.is_highlight} 
                      onChange={e => setFormData({
                        ...formData, 
                        admin_highlight_game: e.target.checked,
                        is_highlight: e.target.checked
                      })} 
                      className="w-4 h-4 rounded border-[#1f212a] bg-[#121318] text-[#268FFF] focus:ring-[#268FFF]" 
                    />
                    <span className="text-white font-semibold">Exibir na seção "Lançamentos e Destaques"</span>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Texto de Destaque no Card</label>
                    <input 
                      type="text" 
                      value={formData.highlight_text} 
                      onChange={e => setFormData({...formData, highlight_text: e.target.value})} 
                      className="w-full bg-[#121318] border border-[#1f212a] rounded-xl p-2.5 text-xs text-white focus:border-[#268FFF] outline-none" 
                      placeholder="Ex: Jogue Agora" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-[#1f212a] mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer">{t('admin_cancel')}</button>
                <button type="submit" className="bg-[#268FFF] hover:bg-[#1f7fe6] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm">{t('admin_save_game')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
